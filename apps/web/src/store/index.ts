import { configureStore } from "@reduxjs/toolkit";

import { authApi } from "./auth";
import { guildsApi } from "./guilds";
import { serversApi } from "./servers";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [guildsApi.reducerPath]: guildsApi.reducer,
    [serversApi.reducerPath]: serversApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, guildsApi.middleware, serversApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
