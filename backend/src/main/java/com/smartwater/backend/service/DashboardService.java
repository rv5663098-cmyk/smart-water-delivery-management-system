package com.smartwater.backend.service;

import com.smartwater.backend.repository.DashboardRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    public DashboardService(DashboardRepository dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }

    public Map<String, Object> getDashboardSummary() {

        Map<String, Object> summary = new HashMap<>();

        summary.put("totalOrders", dashboardRepository.getTotalOrders());
        summary.put("confirmedOrders", dashboardRepository.getConfirmedOrders());
        summary.put("deliveredOrders", dashboardRepository.getDeliveredOrders());
        summary.put("totalRevenue", dashboardRepository.getTotalRevenue());

        return summary;
    }
}