//
//  SMListViewCell.m
//
//  Created by alexk wix on 5/3/16.
//

#import "SMListViewProductCell.h"

@implementation SMListViewProductCell

@synthesize nameLabel = _nameLabel;
@synthesize priceLabel = _priceLabel;
@synthesize discountLabel = _discountLabel;
@synthesize inStockLabel = _inStockLabel;
@synthesize thumbnailImageView = _thumbnailImageView;
@synthesize nProductPoint = _nProductPoint;


- (void)awakeFromNib {
    [super awakeFromNib];
  _thumbnailImageView.layer.cornerRadius = 25;
  _thumbnailImageView.layer.masksToBounds = YES;
  
  _nProductPoint.layer.cornerRadius = 4;
  _nProductPoint.layer.masksToBounds = YES;
  
  _nProductPoint.hidden = YES;
}

- (void)layoutSubviews{
  [super layoutSubviews];
  
  self.contentView.frame = CGRectMake(0, 0, self.frame.size.width, self.frame.size.height);
  
  if(self.editing){
    self.contentView.frame = CGRectMake(20, 0, self.frame.size.width - 10, self.frame.size.height);
  }
  
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];
}

- (void)setItemPrice: (NSObject *)productItem {
  NSString *formattedPrice = [productItem valueForKey:@"formattedPrice"];
  NSNumber *price = [productItem valueForKey:@"price"];
  NSNumber *discountPercentRate = [productItem valueForKey:@"discountPercentRate"];
  NSString *currencySign = [formattedPrice substringToIndex:1];
  NSString* priceWithDiscount = [NSString stringWithFormat:@"%.02f", [price floatValue] - ([price floatValue] * [discountPercentRate floatValue])/100];
  
  self.priceLabel.text = [NSString stringWithFormat:@"%@%@", currencySign, priceWithDiscount];
  
  if ([discountPercentRate isEqual:@0]){
    self.discountLabel.hidden = YES;
  } else {
    NSNumber *strikeSize = [NSNumber numberWithInt:1];
    NSDictionary *strikeThroughAttribute = [NSDictionary dictionaryWithObject:strikeSize
                                                                       forKey:NSStrikethroughStyleAttributeName];
    
    NSAttributedString* strikeThroughText = [[NSAttributedString alloc] initWithString:formattedPrice attributes:strikeThroughAttribute];
    self.discountLabel.attributedText = strikeThroughText;
  }
}

- (void)setItemAmount: (NSObject *)productItem {
  
  NSString *amountText;
  NSObject *inventory = [productItem valueForKey:@"inventory"];
  NSObject *managedProductItemsSummary = [productItem valueForKey:@"managedProductItemsSummary"];
  
  if ([[inventory valueForKey:@"trackingMethod"]  isEqual: @"quantity"]){
    NSNumber *amount = managedProductItemsSummary != nil && [managedProductItemsSummary valueForKey:@"inventoryQuantity"] ? [managedProductItemsSummary valueForKey:@"inventoryQuantity"] : [inventory valueForKey:@"quantity"];
    
    if (amount == 0) {
      amountText = @"Out of stock";
    } else if(amount < [NSNumber numberWithInt:3]) {
      amountText = [NSString stringWithFormat: @"%@ %@", amount, @"in stock"];
    }
    
  } else if([[inventory valueForKey:@"trackingMethod"]  isEqual: @"status"] || [inventory valueForKey:@"trackingMethod"] == nil){
    if ([[inventory valueForKey:@"status"]  isEqual: @"out_of_stock"]) {
      amountText = @"Out of stock";
    }
  }
  
  if (amountText != nil){
    self.inStockLabel.text = amountText;
    if ([amountText isEqual: @"Out of stock"]) {
      self.inStockLabel.textColor = [UIColor colorWithRed:(238/255.0) green:(89/255.0) blue:(81/255.0) alpha:1.0];
    }
  } else {
    self.inStockLabel.hidden = YES;
  }
}

- (void)setData: (NSObject *)data {
  
  self.nameLabel.text = [data valueForKey: @"name"];
  
  [self setItemPrice:data];
  [self setItemAmount:data];
  
  if ([data valueForKey:@"isNewSign"]) {
    self.nProductPoint.hidden = NO;
  }
  
  self.accessoryType = UITableViewCellAccessoryDisclosureIndicator;
  
  UIView *cellBg = [[UIView alloc] init];
  cellBg.backgroundColor = [UIColor colorWithRed:(246/255.0) green:(250/255.0) blue:(255.0/255.0) alpha:1.0];
  cellBg.layer.masksToBounds = YES;
  self.selectedBackgroundView = cellBg;
}

@end
