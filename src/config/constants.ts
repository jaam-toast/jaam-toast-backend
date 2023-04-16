export const BUILD_MESSAGE = {
  CHILD_PROCESS_EXITED_WITH_CODE: "childProcess exited with code >",

  CREATE: {
    WORKING_ON_BUILD_PROJECT:
      "Working on a build using user project resources...",
    COMPLETE_RESOURCE_CREATE: "User project resource creation complete",
    COMPLETE_INSTALL_DEPENDENCIES:
      "Finish installing the necessary files for your project",
    COMPLETE: "A new project's data is created successfully!",
  },
  CREATE_ERROR: {
    FAIL_PROJECT_CREATION: "Project creation failed.",
    FAIL_DOMAIN_CONNECTION: "Domain connection failed.",
    FAIL_RESOURCE_CREATION: "Cannot find build Resource",
    ENVIRONMENT_DATA_NOT_FOUND:
      "Cannot find environment data before create project",
    RECORD_NOT_FOUND: "Cannot find record id after creating DNS Record",
    DOMAIN_CREATE_FAIL: "Domain creation failed",
    UNEXPECTED_DURING_BUILD:
      "An unexpected error occurred during build project",
  },

  DELETE_ERROR: {
    ENVIRONMENT_DATA_NOT_FOUND:
      "Cannot find environment data before delete project.",
    INVALID_PROJECT_NAME: "The project name is invalid.",
    FAIL_TO_DELETE_DOMAIN: "Fail to remove project domain",
  },
};

export const CMS_MESSAGE = {
  CREATE_ERROR: {
    ENVIRONMENT_DATA_NOT_FOUND:
      "Cannot find environment data before create api",
    RECORD_NOT_FOUND: "Cannot find record id after creating DNS Record.",
    UNEXPECTED_DURING_DOMAIN_CREATION:
      "An unexpected error occurred while waiting for domain creation.",
  },

  DELETE_ERROR: {
    ENVIRONMENT_DATA_NOT_FOUND:
      "Cannot find environment data before delete api",
  },
};
