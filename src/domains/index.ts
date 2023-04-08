import { createService } from "../core/createService";
import { buildSlice } from "./slices/buildSlice";

export const service = createService({
  slices: [buildSlice],
  // projections: [],
});

// to use:
service.dispatch({
  name: "StartProjectBuild",
  data: {
    projectName: "ok",
  },
});
