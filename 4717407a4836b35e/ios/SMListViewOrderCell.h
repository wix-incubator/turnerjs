//
//  SMListViewOrderCell.h
//  demo
//
//  Created by alexk wix on 5/8/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "SMListViewCell.h"

@interface SMListViewOrderCell : UITableViewCell<SMListViewCell>

@property (nonatomic, weak) IBOutlet UILabel *orderLabel;
@property (nonatomic, weak) IBOutlet UILabel *priceLabel;
@property (nonatomic, weak) IBOutlet UILabel *paidLabel;
@property (nonatomic, weak) IBOutlet UILabel *dateLabel;
@property (nonatomic, weak) IBOutlet UIImageView *thumbnailImageView;
@property (nonatomic, weak) IBOutlet UIView *nProductPoint;


- (void) setData: (NSObject *)data;
@end
