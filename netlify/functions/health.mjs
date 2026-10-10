export default ()=>Response.json({status:'ok',configured:!!(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET&&process.env.GOOGLE_REFRESH_TOKEN&&(process.env.DRIVE_FOLDER_ID||process.env.DRIVE_CONFIG_FOLDER_ID))},{headers:{'Cache-Control':'no-store'}});
export const config={path:'/healthz'};
