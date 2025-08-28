


// بص عشان نشرح يعني ايه داله asyncHandler
// الداله دي بتاخد داله تانيه كوسيط وبتعملها
// async يعني بتشتغل بشكل غير متزامن
// وبتستخدم في حالة ان الداله اللي جواها ممكن ترجع خطأ
// فبدل ما نستخدم try catch في كل مره بنستخدم فيها الداله دي
// انت بتكتبها ازاي بقى او اللوجيك بتاعها بيكون عامل ازاي 
// هقولك انت الاول بتديها فانكشن عاديه و جوا الفانكشن دي انت هتديها فانكشن بتاخد ريكويسن و ريسبونس و نكست
// وبتعمل فيها كل اللي انت عايزه و لو حصل خطأ في الداله
// هتcatch الخطأ ده و ترجع ريسبونس للعميل ان في


export const asyncHandler = (fn) => (req, res, next) => {
    fn(req, res, next).catch((error) => {
        console.error("Async Handler Error:", error);
        next(new Error(error.message || "Internal Server Error", { cause: error.status || 500 }));
    });
}





// نعمل بقى فانكشن بتاعه ال handlingError

export const globalErrorHandler = (error, req, res, next) => {
    console.error("Global Error Handler:", error);
    res.status(error.cause || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
        error: error.stack || error.toString()
    });
}


//نعمل داله رجوع الريسبونس الناجح بقى 

export const successResponse = ({res, data = {}, message = 'Operation successful', statusCode = 200}={}) => {
    res.status(statusCode).json({
        success: true,
        message,
        data
    });
}
