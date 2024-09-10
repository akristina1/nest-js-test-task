import { User } from './user.entity';
import { Article } from '../../article/entities/article.entity';

describe('User Entity', () => {
  let user: User;
  let article1: Article;
  let article2: Article;

  beforeEach(() => {
    // Create mock user instance
    user = new User();
    user.id = 1;
    user.first_name = 'John';
    user.last_name = 'Doe';
    user.email = 'johndoe@example.com';
    user.password = 'hashedpassword';
    user.role = 'user';
    user.created_at = new Date();
    user.updated_at = new Date();

    // Create two mock articles and associate them with the user
    article1 = new Article();
    article1.id = 1;
    article1.title = 'Article 1';
    article1.description = 'Description 1';
    article1.user = user; // Associate the article with the user

    article2 = new Article();
    article2.id = 2;
    article2.title = 'Article 2';
    article2.description = 'Description 2';
    article2.user = user; // Associate the article with the user

    user.articles = [article1, article2]; // Set the OneToMany relationship
  });

  it('should create a user instance with correct values', () => {
    expect(user.id).toBe(1);
    expect(user.first_name).toBe('John');
    expect(user.last_name).toBe('Doe');
    expect(user.email).toBe('johndoe@example.com');
    expect(user.password).toBe('hashedpassword');
    expect(user.role).toBe('user');
  });

  it('should have a OneToMany relationship with the Article entity', () => {
    expect(user.articles).toBeDefined(); // Check if articles array is defined
    expect(user.articles.length).toBe(2); // There should be 2 articles
    expect(user.articles[0].title).toBe('Article 1'); // Check first article
    expect(user.articles[1].title).toBe('Article 2'); // Check second article
  });

  it('should have created_at and updated_at of type Date', () => {
    expect(user.created_at).toBeInstanceOf(Date);
    expect(user.updated_at).toBeInstanceOf(Date);
  });
});
