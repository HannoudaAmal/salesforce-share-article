import { LightningElement, wire, track } from 'lwc';
import getDashboardData from '@salesforce/apex/DashboardController.getDashboardData';

export default class Dashboard extends LightningElement {
    @track totalUsers;
    @track totalArticles;
    @track topUsers = [];
    @track categoryList = [];

    rowColors = ['row-color-1', 'row-color-2', 'row-color-3', 'row-color-4', 'row-color-5'];

    connectedCallback() {
        getDashboardData()
            .then(data => {
                this.totalUsers = data.totalUsers;
                this.totalArticles = data.totalArticles;
                this.topUsers = data.topUsers;

                // Transform category object into array with color classes
                this.categoryList = Object.entries(data.categoryData).map(([name, count], index) => ({
                    name,
                    count,
                    rowClass: this.rowColors[index % this.rowColors.length]
                }));
            })
            .catch(error => {
                console.error('Dashboard data error', error);
            });
    }
}