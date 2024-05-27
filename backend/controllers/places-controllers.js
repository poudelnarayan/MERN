const uuid = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const mongo = require("mongoose");
const User = require("../models/user");

const Place = require("../models/place");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous skyscrapers in the world!",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Empire_State_Building_from_the_Top_of_the_Rock.jpg/1024px-Empire_State_Building_from_the_Top_of_the_Rock.jpg",
    address: "20 W 34th St, New York, NY 10118, United States",
    location: {
      lat: 40.7484405,
      lng: -73.9878531,
    },
    creator: "u1",
  },
  {
    id: "p2",
    title: "Empire State Building",
    description: "One of the most famous skyscrapers in the world!",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Empire_State_Building_from_the_Top_of_the_Rock.jpg/1024px-Empire_State_Building_from_the_Top_of_the_Rock.jpg",
    address: "20 W 34th St, New York, NY 10118, United States",
    location: {
      lat: 40.7484405,
      lng: -73.9878531,
    },
    creator: "u2",
  },
];

const getAllPlaces = async (req, res, next) => {
  let places;
  try {
    places = await Place.find();
  } catch (err) {
    console.error("Error fetching places:", err);
    return next(
      new HttpError("Fetching places failed, please try again later.", 500)
    );
  }
  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    console.error("Error fetching place:", err);
    return next(
      new HttpError("Something went wrong, could not find a place.", 500)
    );
  }

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id.",
      404
    );
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    console.error("Error fetching places:", err);
    return next(
      new HttpError("Fetching places failed, please try again later.", 500)
    );
  }
  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }
  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Validation errors:", errors.array());
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
    console.log("Coordinates fetched successfully:", coordinates);
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return next(
      new HttpError("Failed to fetch coordinates for the address.", 500)
    );
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Empire_State_Building_from_the_Top_of_the_Rock.jpg/1024px-Empire_State_Building_from_the_Top_of_the_Rock.jpg",
    creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user for provided id.", 404));
  }

  console.log("User found:", user);

  try {
    const session = await mongo.startSession();
    session.startTransaction();
    await createdPlace.save({ session: session });
    user.places.push(createdPlace);
    await user.save({ session: session });
    await session.commitTransaction();
    session.endSession();

    console.log("Place saved successfully:", createdPlace);
  } catch (err) {
    console.error("Error saving place:", err);
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not update place.", 500)
    );
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not update place.", 500)
    );
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;

  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not delete place.", 500)
    );
  }

  if (!place) {
    // If no place is found with the given ID, send a 404 error
    return next(new HttpError("Could not find place for this id.", 404));
  }

  try {
    const session = await mongo.startSession();
    session.startTransaction();
    await place.remove({ session: session });
    place.creator.places.pull(place);
    await place.creator.save({ session: session });
    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not delete place.", 500)
    );
  }
  // If the place is found and deleted, send a success response
  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
exports.getAllPlaces = getAllPlaces;
