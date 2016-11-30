//
//  SMListViewOrderCell.m
//
//  Created by alexk wix on 5/8/16.
//

#import "SMListViewOrderCell.h"

@implementation SMListViewOrderCell

@synthesize orderLabel = _orderLabel;
@synthesize priceLabel = _priceLabel;
@synthesize paidLabel = _paidLabel;
@synthesize dateLabel = _dateLabel;
@synthesize thumbnailImageView = _thumbnailImageView;
@synthesize nProductPoint = _nProductPoint;


- (void)awakeFromNib {
    [super awakeFromNib];
  
  
  self.thumbnailImageView.layer.cornerRadius = 30;
  self.thumbnailImageView.layer.masksToBounds = YES;
  
  self.nProductPoint.layer.cornerRadius = 4;
  self.nProductPoint.layer.masksToBounds = YES;
  self.nProductPoint.hidden = YES;
  
  UIEdgeInsets insets = UIEdgeInsetsMake(-56, 0, 0, 0);
  
  UIImage *customImage = [UIImage imageNamed:@"arrow"];
  UIImageView *accessoryView = [[UIImageView alloc] initWithImage:customImage];
  
  UIView *accessoryWrapperView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, customImage.size.width + insets.left + insets.right, customImage.size.height + insets.top + insets.bottom)];
  
  [accessoryWrapperView addSubview:accessoryView];
  accessoryView.frame = CGRectMake(insets.left, insets.top, customImage.size.width, customImage.size.height);
  
  self.accessoryView = accessoryWrapperView;
  
  UIView *cellBg = [UIView new];
  cellBg.backgroundColor = [UIColor colorWithRed:(246/255.0) green:(250/255.0) blue:(255.0/255.0) alpha:1.0];
  cellBg.layer.masksToBounds = YES;
  self.selectedBackgroundView = cellBg;
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

- (void)setData: (NSObject *)data {
  
  self.orderLabel.text = [data valueForKey: @"orderId"];
  self.dateLabel.text = [data valueForKey: @"strCreatedDate"];
  self.priceLabel.text = [data valueForKey: @"totalPrice"];
  self.paidLabel.text = [[data valueForKey: @"billingStatus"] capitalizedString];
  
  if ([[data valueForKey: @"isPaid"] isEqual:[NSNumber numberWithInt:0]]){
    self.paidLabel.textColor = [UIColor colorWithRed:(238/255.0) green:(89/255.0) blue:(81/255.0) alpha:1.0];
  }
  
  if ([[data valueForKey: @"isNew"] isEqual:[NSNumber numberWithInt:1]]){
    self.orderLabel.font = [UIFont fontWithName:@"HelveticaNeue-Bold" size:17.0f];
    self.dateLabel.font = [UIFont systemFontOfSize:16.0f];
    self.priceLabel.font = [UIFont fontWithName:@"HelveticaNeue-Medium" size:17.0f];
    self.paidLabel.font = [UIFont systemFontOfSize:17.0f];
    self.nProductPoint.hidden = NO;
  }
}

@end
