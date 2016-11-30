//
//  SMListView.h
//  demo
//
//  Created by alexk wix on 4/28/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "RCTView.h"
#import "RCTBridge.h"
#import "SMListViewProductCell.h"

@class RCTEventDispatcher;
@protocol SMListViewDatasource <NSObject>

-(id)initWithDictionary:(NSDictionary *)params ;

-(NSArray *)sections;
@end

@interface SMListView : UIView
@property (nonatomic, assign) NSInteger rawLine;

- (instancetype)initWithEventDispatcher:(RCTEventDispatcher *)eventDispatcher NS_DESIGNATED_INITIALIZER;
- (void)resetState;
@end

