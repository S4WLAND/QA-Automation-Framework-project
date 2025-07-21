import { BasePage } from './BasePage';

interface ProductDetails {
  name: string;
  price: string;
  description: string;
  rating: number;
  availability: string;
}

export class ProductPage extends BasePage {
  private selectors = {
    productName: '[data-testid="product-name"]',
    productPrice: '[data-testid="product-price"]',
    productDescription: '[data-testid="product-description"]',
    productRating: '[data-testid="product-rating"]',
    addToCartButton: '[data-testid="add-to-cart"]',
    quantityInput: '[data-testid="quantity-input"]',
    increaseQuantity: '[data-testid="increase-quantity"]',
    decreaseQuantity: '[data-testid="decrease-quantity"]',
    productImages: '[data-testid="product-images"]',
    imagePreview: '[data-testid="image-preview"]',
    availabilityStatus: '[data-testid="availability-status"]',
    addToWishlistButton: '[data-testid="add-to-wishlist"]',
    shareButton: '[data-testid="share-button"]',
    reviewsSection: '[data-testid="reviews-section"]',
    writeReviewButton: '[data-testid="write-review"]',
    relatedProducts: '[data-testid="related-products"]'
  };

  constructor() {
    super('/product');
  }

  /**
   * Get product details
   */
  async getProductDetails(): Promise<ProductDetails> {
    return {
      name: await this.getTextContent(this.selectors.productName),
      price: await this.getTextContent(this.selectors.productPrice),
      description: await this.getTextContent(this.selectors.productDescription),
      rating: await this.getProductRating(),
      availability: await this.getTextContent(this.selectors.availabilityStatus)
    };
  }

  /**
   * Add product to cart
   */
  async addToCart(quantity: number = 1): Promise<void> {
    await this.setQuantity(quantity);
    await this.safeClick(this.selectors.addToCartButton);
    
    // Wait for cart update animation
    await browser.pause(1000);
  }

  /**
   * Set product quantity
   */
  async setQuantity(quantity: number): Promise<void> {
    // Clear current quantity
    const quantityElement = await $(this.selectors.quantityInput);
    await quantityElement.clearValue();
    await quantityElement.setValue(quantity.toString());
  }

  /**
   * Increase quantity by one
   */
  async increaseQuantity(): Promise<void> {
    await this.safeClick(this.selectors.increaseQuantity);
  }

  /**
   * Decrease quantity by one
   */
  async decreaseQuantity(): Promise<void> {
    await this.safeClick(this.selectors.decreaseQuantity);
  }

  /**
   * Get current quantity
   */
  async getCurrentQuantity(): Promise<number> {
    const element = await $(this.selectors.quantityInput);
    const value = await element.getValue();
    return parseInt(value) || 1;
  }

  /**
   * Get product rating
   */
  async getProductRating(): Promise<number> {
    const ratingElement = await $(this.selectors.productRating);
    const ratingText = await ratingElement.getText();
    const rating = ratingText.match(/(\d+\.?\d*)/);
    return rating ? parseFloat(rating[1]) : 0;
  }

  /**
   * Click product image
   */
  async clickProductImage(imageIndex: number = 0): Promise<void> {
    const images = await $$(`${this.selectors.productImages} img`);
    if (images[imageIndex]) {
      await images[imageIndex].click();
    }
  }

  /**
   * Add to wishlist
   */
  async addToWishlist(): Promise<void> {
    await this.safeClick(this.selectors.addToWishlistButton);
  }

  /**
   * Share product
   */
  async shareProduct(): Promise<void> {
    await this.safeClick(this.selectors.shareButton);
  }

  /**
   * Check if product is in stock
   */
  async isProductInStock(): Promise<boolean> {
    const availabilityText = await this.getTextContent(this.selectors.availabilityStatus);
    return availabilityText.toLowerCase().includes('in stock');
  }

  /**
   * Check if add to cart button is enabled
   */
  async isAddToCartEnabled(): Promise<boolean> {
    const element = await $(this.selectors.addToCartButton);
    return await element.isEnabled();
  }

  /**
   * Navigate to reviews section
   */
  async scrollToReviews(): Promise<void> {
    await this.scrollToElement(this.selectors.reviewsSection);
  }

  /**
   * Write a review
   */
  async writeReview(): Promise<void> {
    await this.safeClick(this.selectors.writeReviewButton);
  }

  /**
   * Get related products count
   */
  async getRelatedProductsCount(): Promise<number> {
    const products = await $$(`${this.selectors.relatedProducts} [data-testid="product-item"]`);
    return products.length;
  }

  /**
   * Click related product
   */
  async clickRelatedProduct(index: number): Promise<void> {
    const products = await $$(`${this.selectors.relatedProducts} [data-testid="product-item"]`);
    if (products[index]) {
      await products[index].click();
    }
  }

  /**
   * Validate product page elements
   */
  async validateProductPageElements(): Promise<boolean> {
    const elements = [
      this.selectors.productName,
      this.selectors.productPrice,
      this.selectors.addToCartButton,
      this.selectors.quantityInput
    ];

    for (const selector of elements) {
      if (!(await this.isElementVisible(selector))) {
        this.logger.error(`Required element not visible: ${selector}`);
        return false;
      }
    }
    return true;
  }
}