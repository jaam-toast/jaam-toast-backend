const sleep = async (ms: number): Promise<Function> => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

export default sleep;
