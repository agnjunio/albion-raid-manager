import { Outlet } from "react-router-dom";

export function ServerLayout() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <Outlet />
    </div>
  );
}
