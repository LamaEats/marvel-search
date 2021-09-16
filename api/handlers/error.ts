import { SaluteHandler } from "@salutejs/scenario";

import { ErrorAction } from "../types";
import { sendError } from "../utils";

export const error: SaluteHandler = ({ req, res }) => {
    const serverAction = req.serverAction as ErrorAction;
    const { error } = serverAction.payload;
    sendError(res, error, error);
}