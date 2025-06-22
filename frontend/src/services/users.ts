import type { UUIDTypes } from "uuid";
import type { UserCreate, UserProfile } from "../schemas/types";

const URL = `${import.meta.env.VITE_BACKEND_URL}/users`

export function createUser(user: UserCreate): Promise<UserProfile> {
    return fetch(URL, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(user),
    })
    .then((res: Response) => res.json());
}

export function getUserByUsername(username: string): Promise<UserProfile> {
    return fetch(`${URL}/?username=${username}`, {
        method: "GET",
        headers: {'content-type': 'application/json'},
    })
    .then((res: Response) => res.json());
}

export function getUserByUUID(uuid: UUIDTypes): Promise<UserProfile> {
    console.log("Getting user by UUID");
    
    return fetch(`${URL}/?uuid=${uuid}`, {
        method: "GET",
        headers: {'content-type': 'application/json'},
    })
    .then((res: Response) => res.json());
}

export function getUsers(): Promise<UserProfile[]> {
    return fetch(URL, {
        method: "GET",
        headers: {'content-type': 'application/json'},
    })
    .then((res: Response) => res.json());
}