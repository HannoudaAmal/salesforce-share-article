import { LightningElement, wire, track } from 'lwc';
import getOtherUsersArticles from '@salesforce/apex/ArticleController.getOtherUsersArticles';
import getArticleCategories from '@salesforce/apex/ArticleController.getArticleCategories';

export default class ArticleListComponent extends LightningElement {
    currentEmail = sessionStorage.getItem('currentEmail');
    @track selectedCategory = '';
    @track articles;
    @track showModal = false;
    @track selectedArticle;
    @track formattedDate;
    @track categoryOptions = [];
    @track columns = [
        { label: 'タイトル', fieldName: 'Title__c', type: 'button', typeAttributes: { label: { fieldName: 'Title__c' }, variant: 'base' } },
        { label: '投稿者', fieldName: 'Username__c', type: 'text' },
        { label: 'カテゴリー', fieldName: 'Category__c', type: 'text' },
        { label: '投稿日', fieldName: 'CreatedDate', type: 'date', typeAttributes: { 
            year: 'numeric', 
            month: '2-digit', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }}
    ];

    connectedCallback() {
        this.currentEmail = sessionStorage.getItem('currentEmail');
        console.log('Current Email:', this.currentEmail); // Add this line
        this.loadCategories();
        this.loadArticles();
    }

    loadCategories() {
        getArticleCategories()
            .then(result => {
                this.categoryOptions = [
                    { label: 'すべて', value: '' },
                    ...result.map(category => ({
                        label: category,
                        value: category
                    }))
                ];
            })
            .catch(error => {
                console.error('Error loading categories', error);
            });
    }

    loadArticles() {
        getOtherUsersArticles({
            currentEmail: this.currentEmail,
            category: this.selectedCategory
        })
        .then(result => {
            this.articles = { data: result };
            console.log('Loaded articles:', result);
        })
        .catch(error => {
            this.articles = { error };
            console.error('Error loading articles:', error);
        });
    }

    handleCategoryChange(event) {
        this.selectedCategory = event.detail.value;
        this.loadArticles();
    }

    handleRowAction(event) {
        const row = event.detail.row;
        this.selectedArticle = row;
        this.formattedDate = new Date(row.CreatedDate).toLocaleString();
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }
}