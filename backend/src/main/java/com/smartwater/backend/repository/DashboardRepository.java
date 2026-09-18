package com.smartwater.backend.repository;

import com.smartwater.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DashboardRepository extends JpaRepository<Order, Long> {

    @Query("""
        SELECT COUNT(o)
        FROM Order o
        """)
    long getTotalOrders();

    @Query("""
        SELECT COUNT(o)
        FROM Order o
        WHERE o.status = 'CONFIRMED'
        """)
    long getConfirmedOrders();

    @Query("""
        SELECT COUNT(o)
        FROM Order o
        WHERE o.status = 'DELIVERED'
        """)
    long getDeliveredOrders();

    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM Order o
        """)
    double getTotalRevenue();
}