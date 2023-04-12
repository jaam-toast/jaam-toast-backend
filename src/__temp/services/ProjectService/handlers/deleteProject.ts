// import DB from "../../../services/DBService";
// import ProjectService from "../../../services/ProjectService";

// const deleteProject = async (
//   service: ProjectService,
//   next: Function,
// ): Promise<void> => {
//   const { projectName } = service;

//   try {
//     const deletedProject = await DB.Project.findOneAndDelete({ projectName });

//     if (!deletedProject) {
//       service.throw("Failed to delete database.");
//     }

//     service.projectId = deletedProject._id;
//   } catch (error) {
//     service.throw("An unexpected error occurred during delete project.", error);
//   }

//   next();
// };

// export default deleteProject;
