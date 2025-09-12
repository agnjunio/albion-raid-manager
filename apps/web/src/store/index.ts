import { configureStore } from "@reduxjs/toolkit";

import { authApi } from "./auth";
import { itemsApi } from "./items";
import { raidsApi } from "./raids";
import { serversApi } from "./servers";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [itemsApi.reducerPath]: itemsApi.reducer,
    [raidsApi.reducerPath]: raidsApi.reducer,
    [serversApi.reducerPath]: serversApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, itemsApi.middleware, raidsApi.middleware, serversApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
