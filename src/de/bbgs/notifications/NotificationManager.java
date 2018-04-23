package de.bbgs.notifications;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

/**
 *
 */
public class NotificationManager
{
    private static final NotificationManager INSTANCE = new NotificationManager();

    private ConcurrentHashMap<Integer, LinkedBlockingQueue<Notification>> queues = new ConcurrentHashMap<>();

    /**
     * 
     */
    private NotificationManager()
    {

    }

    /**
     * @return
     */
    public static NotificationManager getInstance()
    {
        return NotificationManager.INSTANCE;
    }

    /**
     * @param to
     * @param title
     * @param msg
     */
    public void sendUnicast(int to, String title, String msg, Object... args)
    {
        Notification n = new Notification();
        n.title = title;
        n.message = String.format(msg, args);

        this.getOrCreateQueueFor(to).add(n);
    }

    /**
     * @param to
     * @param maxWait
     * @return
     * @throws InterruptedException 
     */
    public List<Notification> getAllNotificationsFor(int to, long maxWait) throws InterruptedException
    {
        List<Notification> result = new ArrayList<>();

        LinkedBlockingQueue<Notification> queue = this.getOrCreateQueueFor(to);
        queue.drainTo(result);
        if (result.isEmpty())
        {
            Notification n = queue.poll(maxWait, TimeUnit.MILLISECONDS);
            if (n != null)
            {
                result.add(n);
            }
        }
        return result;
    }

    /**
     * @param to
     * @return
     */
    private LinkedBlockingQueue<Notification> getOrCreateQueueFor(int to)
    {
        LinkedBlockingQueue<Notification> queue = this.queues.get(Integer.valueOf(to));

        if (queue == null)
        {
            queue = new LinkedBlockingQueue<Notification>();
            LinkedBlockingQueue<Notification> tmp = this.queues.putIfAbsent(Integer.valueOf(to), queue);
            if (tmp != null)
            {
                queue = tmp;
            }
        }
        return queue;
    }
}
