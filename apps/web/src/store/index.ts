import { configureStore } from "@reduxjs/toolkit";

import { authApi } from "./auth";
import { compositionsApi } from "./compositions";
import { guildsApi } from "./guilds";
import { raidsApi } from "./raids";
import { serversApi } from "./servers";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [compositionsApi.reducerPath]: compositionsApi.reducer,
    [guildsApi.reducerPath]: guildsApi.reducer,
    [raidsApi.reducerPath]: raidsApi.reducer,
    [serversApi.reducerPath]: serversApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      compositionsApi.middleware,
      guildsApi.middleware,
      raidsApi.middleware,
      serversApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
