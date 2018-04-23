package de.bbgs.utils;

import java.util.logging.Logger;

public class BBGSLog
{
//    private static Logger log = Logger.getLogger("BBGS");
    private static Logger log = Logger.getGlobal();

    /**
     * @param logId
     * @param obj
     */
    public static void logDebug(String logId, Object... obj)
    {
        log.fine(Messages.formatMsg(logId, obj));
    }

    /**
     * @param logId
     * @param obj
     */
    public static void logInfo(String logId, Object... obj)
    {
        log.info(Messages.formatMsg(logId, obj));
    }

    /**
     * @param logId
     * @param obj
     */
    public static void logWarn(String logId, Object... obj)
    {
        log.warning(Messages.formatMsg(logId, obj));
    }

    /**
     * @param logId
     * @param obj
     */
    public static void logError(String logId, Object... obj)
    {
        log.severe(Messages.formatMsg(logId, obj));
    }
}
