import { asyncHandler } from "../utils/response.js"

export const validationMiddleware = (schema , source = "all") => {
    return asyncHandler(
        async (req, res, next) => {
            const { error } = schema.validate(req[source] , { abortEarly: false });
            let data;
            if(source==="all"){
                data = { ...req.body, ...req.query, ...req.params };
            } else {
            data = req[source];
        }
            if (error) {
                return res.status(400)
                .json({ success: false,
                message: "Validation Error",
                errors: error.details.map((e) => e.message),});
            }
            next();
        }
        );
    }
