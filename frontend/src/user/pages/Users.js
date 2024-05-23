import React from "react";

import UsersList from "../components/UsersList";

const Users = () => {
  const USERS = [
    {
      id: "u1",
      name: "Max Schwarz",
      image: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg",
      places: 3,
    },
    {
      id: "u2",
      name: "Manuel Lorenz",
      image: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg",
      places: 3,
    },
    {
      id: "u3",
      name: "Julie Jones",
      image: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg",
      places: 2,
    },
    {
      id: "u4",
      name: "Julie Jones",
      image: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg",
      places: 2,
    },
  ];

  return <UsersList items={USERS} />;
};

export default Users;
