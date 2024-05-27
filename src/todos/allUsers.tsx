import React, { ChangeEvent, useEffect } from "react";
import { useQuery } from "react-query";
import { v4 as uuidv4 } from "uuid";

import { api } from "../api";
import { allUsersT } from "../types";
import "./styles.scss";
import { useInView } from "react-intersection-observer";

export const AllUsers = () => {
  const [users, setUsers] = React.useState<allUsersT[]>([]);
  const [user, setUser] = React.useState<allUsersT>({
    userId: "",
    id: 0,
    title: "",
    completed: false,
  });
  const [inputValue, setInpuValue] = React.useState<string>("");
  const limit = 20;
  const [page, setPage] = React.useState<number>(limit);

  const { ref, inView } = useInView({
    threshold: 1,
  });

  const { data, isLoading } = useQuery("allUsers", api.allUsers, {
    onSuccess: (data) => {
      setUsers(data.filter((_, i) => i < limit));
    },
  });

  const highlightSearchTerm = (text: string) => {
    if (!inputValue) {
      return text;
    }

    const searchTerm = inputValue.toLowerCase();
    const parts = text.toLowerCase().split(searchTerm);

    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < parts.length - 1 && <mark>{searchTerm}</mark>}
      </React.Fragment>
    ));
  };

  const searchUser = (e: ChangeEvent<HTMLInputElement>) => {
    setInpuValue(e.currentTarget.value);
  };

  useEffect(() => {
    const filteredUsers = data?.filter((user) =>
      user.title.toLowerCase().includes(inputValue.toLowerCase())
    );
    if(!inputValue) {
      setUsers(data?.filter((_, i) => i < limit) ?? [])
    } else {
      setUsers(filteredUsers ?? []);
    }
    // eslint-disable-next-line
  }, [inputValue]);

  useEffect(() => {
    if (data?.length === page) {
      return;
    }

    if (inView && !inputValue) {
      setPage((e) => e + 10);
      setUsers(data?.filter((_, i) => i < limit + page) ?? [])
    }
    // eslint-disable-next-line
  }, [inView, data?.length]);
  const generateNumericId = () => {
    const uuid = uuidv4();
    const numericId = parseInt(uuid.replace(/-/g, ""), 16);
    return numericId;
  };

  const handleAddedUsersInfo = (e: ChangeEvent<HTMLInputElement>) => {
    setUser({
      userId: uuidv4(),
      id: generateNumericId(),
      title: e.currentTarget.value,
      completed: false,
    });
  };

  const handleRemoveUsersInfo = (e: number) => {
    setUsers((users) => users.filter((item) => item.id !== e));
  };

  return (
    <div className="container">
      <div>
        <input
          onChange={searchUser}
          value={inputValue}
          type="text"
          name="serach"
          id="search"
          placeholder="search"
        />
      </div>
      <div>
        <input type="text" placeholder="add" onChange={handleAddedUsersInfo} />
        <button onClick={() => setUsers((e) => [...e, user])}>add</button>
      </div>
      <div className="scrollingContainer">
        {users.length > 0 &&
          users.map(({ title, id, completed }: allUsersT, i) => {
            return (
              <div
                key={id + i}
                className="item"
                ref={ref}
                onClick={() => handleRemoveUsersInfo(id)}
              >
                <div>
                  <div>{id}</div>
                  <div>{highlightSearchTerm(title)}</div>
                </div>
                <div>{completed ? "true" : "false"}</div>
              </div>
            );
          })}
        {isLoading && <div>Loading....</div>}
        {users.length <= 0 && !isLoading && "DATA NOT FOUND"}
      </div>
    </div>
  );
};
