import moment from 'moment';
import { Logger } from './Logger';

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateOfBirth: string;
  ssn?: string;
}

export interface ProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  inStock: boolean;
  quantity: number;
}

export interface OrderData {
  orderId: string;
  customerEmail: string;
  items: ProductData[];
  totalAmount: number;
  orderDate: string;
  status: string;
}

export class DataGenerator {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('DataGenerator');
  }

  /**
   * Generate random user data
   */
  generateUser(options: Partial<UserData> = {}): UserData {
    const firstName = options.firstName || this.getRandomFirstName();
    const lastName = options.lastName || this.getRandomLastName();
    const domain = this.getRandomEmailDomain();
    
    return {
      firstName,
      lastName,
      email: options.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      phone: options.phone || this.generatePhoneNumber(),
      address: options.address || this.generateAddress(),
      dateOfBirth: options.dateOfBirth || this.generateDateOfBirth(),
      ssn: options.ssn || this.generateSSN()
    };
  }

  /**
   * Generate random product data
   */
  generateProduct(options: Partial<ProductData> = {}): ProductData {
    const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys'];
    const adjectives = ['Premium', 'Professional', 'Deluxe', 'Standard', 'Compact', 'Wireless'];
    const nouns = ['Device', 'Tool', 'Kit', 'Set', 'System', 'Solution'];

    return {
      name: options.name || `${this.getRandomItem(adjectives)} ${this.getRandomItem(nouns)}`,
      description: options.description || this.generateProductDescription(),
      price: options.price || this.generatePrice(),
      category: options.category || this.getRandomItem(categories),
      sku: options.sku || this.generateSKU(),
      inStock: options.inStock !== undefined ? options.inStock : Math.random() > 0.1,
      quantity: options.quantity || Math.floor(Math.random() * 100) + 1
    };
  }

  /**
   * Generate random order data
   */
  generateOrder(options: Partial<OrderData> = {}): OrderData {
    const items = options.items || [this.generateProduct(), this.generateProduct()];
    const totalAmount = options.totalAmount || items.reduce((sum, item) => sum + item.price, 0);
    
    return {
      orderId: options.orderId || this.generateOrderId(),
      customerEmail: options.customerEmail || this.generateUser().email,
      items,
      totalAmount,
      orderDate: options.orderDate || moment().format('YYYY-MM-DD HH:mm:ss'),
      status: options.status || this.getRandomOrderStatus()
    };
  }

  /**
   * Generate test email
   */
  generateTestEmail(prefix: string = 'test'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}_${timestamp}_${random}@testdomain.com`;
  }

  /**
   * Generate random password
   */
  generatePassword(length: number = 12, includeSpecialChars: boolean = true): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let charset = lowercase + uppercase + numbers;
    if (includeSpecialChars) {
      charset += specialChars;
    }

    let password = '';
    
    // Ensure at least one character from each required set
    password += this.getRandomChar(lowercase);
    password += this.getRandomChar(uppercase);
    password += this.getRandomChar(numbers);
    if (includeSpecialChars) {
      password += this.getRandomChar(specialChars);
    }

    // Fill remaining length with random characters
    for (let i = password.length; i < length; i++) {
      password += this.getRandomChar(charset);
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Generate random date in range
   */
  generateDateInRange(startDate: string, endDate: string): string {
    const start = moment(startDate);
    const end = moment(endDate);
    const randomDate = moment(start + Math.random() * (end.valueOf() - start.valueOf()));
    return randomDate.format('YYYY-MM-DD');
  }

  /**
   * Generate credit card number (test only)
   */
  generateTestCreditCard(): { number: string; expiry: string; cvv: string; type: string } {
    const testCards = {
      visa: '4111111111111111',
      mastercard: '5555555555554444',
      amex: '378282246310005',
      discover: '6011111111111117'
    };

    const types = Object.keys(testCards);
    const type = this.getRandomItem(types);
    const number = testCards[type as keyof typeof testCards];
    
    return {
      number,
      expiry: moment().add(2, 'years').format('MM/YY'),
      cvv: type === 'amex' ? '1234' : '123',
      type
    };
  }

  /**
   * Generate bulk test data
   */
  generateBulkUsers(count: number): UserData[] {
    return Array.from({ length: count }, () => this.generateUser());
  }

  generateBulkProducts(count: number): ProductData[] {
    return Array.from({ length: count }, () => this.generateProduct());
  }

  generateBulkOrders(count: number): OrderData[] {
    return Array.from({ length: count }, () => this.generateOrder());
  }

  // Private helper methods
  private getRandomFirstName(): string {
    const names = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Emily'];
    return this.getRandomItem(names);
  }

  private getRandomLastName(): string {
    const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    return this.getRandomItem(names);
  }

  private getRandomEmailDomain(): string {
    const domains = ['example.com', 'test.com', 'demo.org', 'sample.net', 'testsite.com'];
    return this.getRandomItem(domains);
  }

  private generatePhoneNumber(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${exchange}-${number}`;
  }

  private generateAddress(): UserData['address'] {
    const streets = ['Main St', 'Oak Ave', 'Park Blvd', 'First St', 'Second Ave', 'Third St'];
    const cities = ['Springfield', 'Franklin', 'Georgetown', 'Madison', 'Clinton', 'Salem'];
    const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
    
    return {
      street: `${Math.floor(Math.random() * 9999) + 1} ${this.getRandomItem(streets)}`,
      city: this.getRandomItem(cities),
      state: this.getRandomItem(states),
      zipCode: String(Math.floor(Math.random() * 90000) + 10000),
      country: 'US'
    };
  }

  private generateDateOfBirth(): string {
    const minAge = 18;
    const maxAge = 80;
    const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
    return moment().subtract(age, 'years').format('YYYY-MM-DD');
  }

  private generateSSN(): string {
    const area = Math.floor(Math.random() * 900) + 100;
    const group = Math.floor(Math.random() * 90) + 10;
    const serial = Math.floor(Math.random() * 9000) + 1000;
    return `${area}-${group}-${serial}`;
  }

  private generateProductDescription(): string {
    const descriptions = [
      'High-quality product with excellent features and durability.',
      'Professional grade item designed for optimal performance.',
      'Innovative design meets exceptional functionality.',
      'Premium materials and craftsmanship for lasting value.',
      'User-friendly design with advanced capabilities.'
    ];
    return this.getRandomItem(descriptions);
  }

  private generatePrice(): number {
    return Math.round((Math.random() * 1000 + 10) * 100) / 100;
  }

  private generateSKU(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let sku = '';
    
    // 3 letters + 4 numbers
    for (let i = 0; i < 3; i++) {
      sku += this.getRandomChar(letters);
    }
    for (let i = 0; i < 4; i++) {
      sku += this.getRandomChar(numbers);
    }
    
    return sku;
  }

  private generateOrderId(): string {
    const prefix = 'ORD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  private getRandomOrderStatus(): string {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    return this.getRandomItem(statuses);
  }

  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getRandomChar(charset: string): string {
    return charset.charAt(Math.floor(Math.random() * charset.length));
  }
}