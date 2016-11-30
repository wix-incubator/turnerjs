//
//  SMListViewCell.h
//  demo
//
//  Created by alexk wix on 5/3/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "SMListViewCell.h"

@interface SMListViewProductCell : UITableViewCell <SMListViewCell>

@property (nonatomic, weak) IBOutlet UILabel *nameLabel;
@property (nonatomic, weak) IBOutlet UILabel *priceLabel;
@property (nonatomic, weak) IBOutlet UILabel *discountLabel;
@property (nonatomic, weak) IBOutlet UILabel *inStockLabel;
@property (nonatomic, weak) IBOutlet UIImageView *thumbnailImageView;
@property (nonatomic, weak) IBOutlet UIView *nProductPoint;


- (void) setItemPrice: (NSObject *)productItem;
- (void) setItemAmount: (NSObject *)productItem;
- (void) setData: (NSObject *)data;
@end
