/* eslint-disable prettier/prettier */
export const CheckValidString = (str:string) => {
    if(str.includes("'") || str.includes("--"))
    {
        return true
  }
    return false

};
