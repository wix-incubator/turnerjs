//
//  SMListViewCell.h
//  Created by alexk wix on 5/8/16.
//

@protocol SMListViewCell

@property (nonatomic, weak) IBOutlet UIImageView *thumbnailImageView;
@property (nonatomic, weak) IBOutlet UIView *nProductPoint;

- (void) setData: (NSObject *)data;

@end
