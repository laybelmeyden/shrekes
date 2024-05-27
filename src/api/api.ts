import { allUsersT } from "../types";

export const api = {
    allUsers: (): Promise<allUsersT[]> =>
    fetch(`https://jsonplaceholder.typicode.com/todos`).then(response => response.json())
}