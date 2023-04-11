import { createSlice } from "@src/core";

export const buildSlice = createSlice<"ProjectAggregate">({
  handlers: {
    StartProjectBuild: (event, aggregate, publish) => {
      publish({
        name: "EndProjectBuild",
        data: {
          result: "okok",
        },
      });
    },
    // EndProjectBuild: (event, aggregate, publish) => {
    //   console.log("start end handler");
    //   console.log(event);
    //   console.log(aggregate);
    // },
    // EndProjectBuild: (event, aggregate, publish) => {},
    EndProjectBuild: (event, aggregate, publish) => {},
  },
});
