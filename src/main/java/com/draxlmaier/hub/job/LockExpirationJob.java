package com.draxlmaier.hub.job;

import jakarta.ejb.Schedule;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.logging.Logger;

/**
 * Scheduled job to clear expired locks from all entities.
 * Runs every 5 minutes to clean up locks older than 5 minutes.
 */
@Stateless
@Transactional
public class LockExpirationJob {

    private static final Logger logger = Logger.getLogger(LockExpirationJob.class.getName());
    private static final int LOCK_EXPIRATION_MINUTES = 5;

    @PersistenceContext
    private EntityManager em;

    /**
     * Clear expired locks from complaints and requests.
     * Runs every 5 minutes
     */
    @Schedule(minute = "*/5", hour = "*", persistent = false)
    public void clearExpiredLocks() {
        logger.info("Running lock expiration job...");

        LocalDateTime expirationTime = LocalDateTime.now().minusMinutes(LOCK_EXPIRATION_MINUTES);

        // Clear expired locks from complaints
        int complaintsCleared = em.createQuery(
            "UPDATE Complaint c SET c.lockedBy = null, c.lockedAt = null " +
            "WHERE c.lockedAt IS NOT NULL AND c.lockedAt < :expirationTime")
            .setParameter("expirationTime", expirationTime)
            .executeUpdate();

        // Clear expired locks from requests
        int requestsCleared = em.createQuery(
            "UPDATE Request r SET r.lockedBy = null, r.lockedAt = null " +
            "WHERE r.lockedAt IS NOT NULL AND r.lockedAt < :expirationTime")
            .setParameter("expirationTime", expirationTime)
            .executeUpdate();

        logger.info(String.format(
            "Lock expiration job completed. Cleared: Complaints=%d, Requests=%d",
            complaintsCleared, requestsCleared));
    }
}
