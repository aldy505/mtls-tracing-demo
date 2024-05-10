import { atom } from "nanostores";

export type User = {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
}
export const $user = atom<User>({
    id: "",
    name: "",
    email: "",
    role: "user",
})