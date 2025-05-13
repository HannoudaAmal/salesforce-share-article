public with sharing class DashboardController {

    @AuraEnabled(cacheable=true)
    public static Integer getTotalUsers() {
        return [SELECT COUNT() FROM AppUser__c];
    }

    @AuraEnabled(cacheable=true)
    public static Integer getTotalArticles() {
        return [SELECT COUNT() FROM AppArticle__c];
    }

    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> getArticlesByCategory() {
        return [
            SELECT Category__c, COUNT(Id) articleCount
            FROM AppArticle__c
            GROUP BY Category__c
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getTopThreeUsers() {
        List<AggregateResult> results = [
            SELECT Username__c, COUNT(Id) articleCount
            FROM AppArticle__c
            GROUP BY Username__c
            ORDER BY COUNT(Id) DESC
            LIMIT 3
        ];

        List<Map<String, Object>> data = new List<Map<String, Object>>();
        for (AggregateResult ar : results) {
            Map<String, Object> row = new Map<String, Object>();
            row.put('username', (String)ar.get('Username__c'));
            row.put('count', (Integer)ar.get('articleCount'));
            data.add(row);
        }
        return data;
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getDashboardData() {
        Map<String, Object> dashboardData = new Map<String, Object>();

        Integer totalUsers = getTotalUsers();
        Integer totalArticles = getTotalArticles();
        List<AggregateResult> categoryData = getArticlesByCategory();
        List<Map<String, Object>> topUsers = getTopThreeUsers();

        dashboardData.put('totalUsers', totalUsers);
        dashboardData.put('totalArticles', totalArticles);

        Map<String, Integer> categoryMap = new Map<String, Integer>();
        for (AggregateResult ar : categoryData) {
            categoryMap.put((String)ar.get('Category__c'), (Integer)ar.get('articleCount'));
        }

        dashboardData.put('categoryData', categoryMap);
        dashboardData.put('topUsers', topUsers);

        return dashboardData;
    }
}