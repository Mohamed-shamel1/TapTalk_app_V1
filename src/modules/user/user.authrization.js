import { roleEnum } from "../../model/user.model.js";



export const endpoint = {
    Profile :[roleEnum.user , roleEnum.admin],
    restoreAccount:[roleEnum.admin],
    deleteAccount:[roleEnum.admin]
}