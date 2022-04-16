import { ActionType } from "../src/types/types";
import { Endpoint, EndpointResponse,  } from "./endpoints";

export const cache = new Map<ActionType, EndpointResponse[Endpoint]>();