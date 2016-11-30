//
//  SMListView.m
//
//  Created by alexk wix on 4/28/16.
//

#import "SMListView.h"
#import "RCTViewManager.h"
#import "RCTEventDispatcher.h"
#import "UIView+React.h"
#import "SMListViewProductCell.h"
#import "SMListViewOrderCell.h"
#import "SMListViewCell.h"

@interface SMListView()<UITableViewDataSource, UITableViewDelegate, UISearchBarDelegate> {
  id<UITableViewDataSource> dataSource;
  NSArray *sectionTitles;
  NSMutableArray *cells;
  RCTEventDispatcher *_eventDispatcher;
}

@property (strong, nonatomic) NSMutableArray *selectedIndexes;
@property (strong, nonatomic) UITableView* tableView;
@property (nonatomic, strong) NSMutableDictionary* dataArray;
@property (nonatomic, strong) NSMutableArray* selectedObjects;
@property (nonatomic, strong) NSArray* dataSectionTitles;
@property (nonatomic, strong) NSArray* dataIndexTitles;
@property (nonatomic, strong) NSString* json;
@property (nonatomic, strong) UISearchBar* searchBar;
@property(nonatomic, readonly) NSIndexPath* indexPathForSelectedRow;
@property (nonatomic, strong) NSMutableDictionary* filteredTableData;
@property (nonatomic, strong) NSArray* allProducts;
@property (nonatomic, strong) NSArray* sectionsSettings;
@property (nonatomic, strong) NSString* mode;
@property (nonatomic, strong) NSString* cellMediaUrl;
@property (nonatomic, strong) NSString* cellMediaPostfix;
@property (nonatomic, strong) NSString* searchKey;
@property (nonatomic, strong) NSMutableDictionary* images;

@property BOOL isFiltered;
@property BOOL isNewSign;

@end

@implementation SMListView

- (instancetype)initWithEventDispatcher:(RCTEventDispatcher *)eventDispatcher
{
  RCTAssertParam(eventDispatcher);
  
  if ((self = [super initWithFrame:CGRectZero])) {
    _eventDispatcher = eventDispatcher;
    
    self.tableView = [[UITableView alloc] initWithFrame:self.bounds];
    self.tableView.autoresizingMask = UIViewAutoresizingFlexibleWidth|UIViewAutoresizingFlexibleHeight;
    
    [self addSubview:self.tableView];
    
    self.tableView.allowsMultipleSelectionDuringEditing = YES;
    self.tableView.dataSource = self;
    self.tableView.delegate = self;
    
    self.searchBar = [[UISearchBar alloc] initWithFrame:CGRectMake(0, 0, [UIScreen mainScreen].bounds.size.width, 44)];
    self.searchBar.showsCancelButton = NO;
    self.searchBar.delegate = self;
    self.tableView.tableHeaderView = self.searchBar;
    
    cells = [NSMutableArray new];
    
    [self.tableView setSeparatorStyle:UITableViewCellSeparatorStyleSingleLine];
    
    self.dataArray = [NSMutableDictionary new];
    self.dataSectionTitles = [self.dataArray allKeys];
    
    self.images = [NSMutableDictionary new];
  }
  
  return self;
}

- (void)searchBar:(UISearchBar *)searchBar textDidChange:(NSString *)searchText {
  
  if(searchText.length == 0) {
    self.isFiltered = NO;
  } else {
    self.isFiltered = YES;
    self.filteredTableData = [NSMutableDictionary new];
    
    NSPredicate *pred = [NSPredicate predicateWithFormat:@"(%K BEGINSWITH[c] %@)", self.searchKey, searchText];

    for(NSDictionary *section in self.sectionsSettings) {
      self.filteredTableData[[section valueForKey:@"title"]] = [[self.dataArray objectForKey:[section valueForKey:@"title"]] filteredArrayUsingPredicate: pred];
    }
  }
  
  [self.tableView reloadData];
}


- (void)searchBarCancelButtonClicked:(UISearchBar *)searchBar {
  [self resetState];
}

- (void)searchBarTextDidBeginEditing:(UISearchBar *)searchBar{
  [self.searchBar setShowsCancelButton:YES animated:NO];
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
  NSString *sectionTitle = [self.dataSectionTitles objectAtIndex:section];
  NSArray *sectionData = self.isFiltered
    ? [self.filteredTableData objectForKey:sectionTitle]
    : [self.dataArray objectForKey:sectionTitle];
  
  return [sectionData count];
}

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
  return [self.dataSectionTitles count];
}

- (NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section
{
  NSString *sectionTitle = [self.dataSectionTitles objectAtIndex:section];
  NSArray *sectionData = self.isFiltered
  ? [self.filteredTableData objectForKey:sectionTitle]
  : [self.dataArray objectForKey:sectionTitle];
  
  NSPredicate *pred = [NSPredicate predicateWithFormat:@"title == %@", sectionTitle];
  NSArray *sectionSetting = [self.sectionsSettings filteredArrayUsingPredicate:pred];
  
  if(sectionSetting[0] != nil){
    sectionTitle = [[sectionSetting[0] valueForKey:@"showAmount"] isEqual:[NSNumber numberWithInt:1]]
      ? [NSString stringWithFormat: @"%@ (%lu)", sectionTitle, (unsigned long)[sectionData count]]
      : sectionTitle;
  }
  
  return [sectionData count] ? sectionTitle : nil;
}

- (UIView *)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section {
  
  UIView *viewHeader = [UIView.alloc initWithFrame:CGRectMake(0, 0, [UIScreen mainScreen].bounds.size.width, 32)];
  UILabel *labelTitle = [UILabel.alloc initWithFrame:CGRectMake(16, 0, [UIScreen mainScreen].bounds.size.width - 16, 30)];
  NSString *sectionHeaderText = [self tableView:tableView titleForHeaderInSection:section];
  
  labelTitle.font = [UIFont systemFontOfSize:13 weight:UIFontWeightMedium];
  labelTitle.textColor = [UIColor colorWithRed:(129/255.0) green:(151/255.0) blue:(169/255.0) alpha:1.0];
  labelTitle.text = [sectionHeaderText uppercaseString];
  labelTitle.textAlignment = NSTextAlignmentLeft;
  
  viewHeader.backgroundColor = [UIColor colorWithRed:(244/255.0) green:(244/255.0) blue:(244/255.0) alpha:1.0];
  [viewHeader addSubview:labelTitle];
  
  return viewHeader;
}

- (id <SMListViewCell>)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
  static NSString *simpleTableIdentifier = @"SimpleTableCell";
  
  id <SMListViewCell> cell = [self.tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];
  
  if (cell == nil)
  {
    NSArray *nib = [[NSBundle mainBundle] loadNibNamed:@"SMListViewCell" owner:self options:nil];
    
    cell = [nib objectAtIndex: [self.mode isEqual:@"product"] ? 0 : 1];
  }
  
  NSString *sectionTitle = [self.dataSectionTitles objectAtIndex:indexPath.section];
  NSArray *sectionData = self.isFiltered
    ? [self.filteredTableData objectForKey:sectionTitle]
    : [self.dataArray objectForKey:sectionTitle];
  
  NSDictionary *data = [sectionData objectAtIndex:indexPath.row];
  
  UIImage *cellImage = [self.images objectForKey: [data valueForKey:@"id"]];
  
  
  
  cell.thumbnailImageView.image = (cellImage != nil)
    ? cellImage
    : [UIImage imageNamed:@"photoPlaceholder"];
  
  if (cellImage == nil && ![[data valueForKey: @"mediaUrl"] isEqual:@""]) {
    
    NSURL *url = [NSURL URLWithString:[NSString stringWithFormat:@"%@%@%@", self.cellMediaUrl,[data valueForKey: @"mediaUrl"], self.cellMediaPostfix]];
    
    NSURLSessionTask *task = [[NSURLSession sharedSession] dataTaskWithURL:url completionHandler:^(NSData * _Nullable imdata, NSURLResponse * _Nullable response, NSError * _Nullable error) {
      if (imdata) {
        UIImage *image = [UIImage imageWithData:imdata];
        
        self.images[[data valueForKey:@"id"]] = image;
        
        if (image) {
          dispatch_async(dispatch_get_main_queue(), ^{
            id <SMListViewCell> updateCell = (id)[self.tableView cellForRowAtIndexPath:indexPath];
            if (updateCell){
              updateCell.thumbnailImageView.image = image;
            }
          });
        }
      }
    }];
    [task resume];
  }
  
  [cell setData:data];
  
  return cell;
}

- (NSInteger)tableView:(UITableView *)tableView sectionForSectionIndexTitle:(NSString *)title atIndex:(NSInteger)index
{
  return [self.dataSectionTitles indexOfObject:title];
}

-(CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
  return [self.mode isEqual:@"product"] ? 82 : 110;
}

-(void)setEditing:(BOOL)editing {
  [self.tableView setEditing:editing animated:YES];

  self.selectedObjects = [NSMutableArray new];
}

-(void)setJson:(NSString*)json {
  
  NSData *jsonData = [json dataUsingEncoding:NSUTF8StringEncoding];
  NSError *e;
  self.allProducts = [NSJSONSerialization JSONObjectWithData:jsonData options:NSJSONReadingMutableContainers error:&e];
  
  for(NSDictionary *section in self.sectionsSettings) {
    NSDictionary *cond = [section valueForKey:@"condition"];
    NSString *dataKey = [cond allKeys][0];
    NSString *dataValue = [cond allValues][0];
    
    NSArray* filtred = [self.allProducts filteredArrayUsingPredicate:[NSPredicate predicateWithFormat:@"%K == %@", dataKey, dataValue]];
    
    [self.dataArray setObject:filtred forKey:[section valueForKey:@"title"]];
    
  }
  
  self.dataSectionTitles = [self.dataArray allKeys];
  
  [self resetState];
}

-(void) setSections: (NSArray*) sections{
  self.sectionsSettings = sections;
}

-(void) setShowNewSign: (BOOL) showNewSign{
  self.isNewSign = showNewSign;
}

-(void) setShowSearch: (BOOL) showSearch{
  if (!showSearch) {
    self.tableView.tableHeaderView = nil;
  } else {
    self.tableView.tableHeaderView = self.searchBar;
  }
}

-(void) setViewMode: (NSString *) viewMode {
    self.mode = viewMode;
}

-(void) setMediaUrl: (NSString *) mediaUrl {
  self.cellMediaUrl = mediaUrl;
}

-(void) setMediaPostFix: (NSString *) mediaPostFix {
  self.cellMediaPostfix = mediaPostFix;
}

-(void) setSearchField: (NSString *)searchField {
  self.searchKey = searchField;
  
  NSLog(@"%@", searchField);
}

- (void)layoutSubviews {
  [self.tableView setSeparatorInset:UIEdgeInsetsMake(0, 25, 0, 0)];
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
  [self updateSelectedItems:@"select" atSection: [NSNumber numberWithLong:indexPath.section] atRow:[NSNumber numberWithLong:indexPath.row]];
  
  if (!self.tableView.editing){
    [self.tableView deselectRowAtIndexPath:indexPath animated:YES];
  }
}

- (void)tableView:(UITableView *)tableView didDeselectRowAtIndexPath:(NSIndexPath *)indexPath {
  [self updateSelectedItems:@"deselect" atSection: [NSNumber numberWithLong:indexPath.section] atRow:[NSNumber numberWithLong:indexPath.row]];
}


- (void)updateSelectedItems:(NSString *)mode atSection:(NSNumber *)sectionIndex atRow:(NSNumber *)rowIndex {
  
  NSString *eventName = @"onSelect";
  NSMutableDictionary *newValue = [NSMutableDictionary new];

  newValue[@"target"] = self.reactTag;
  
  if (self.tableView.editing){
    eventName = @"onMultipleSelect";
    if (self.selectedObjects != nil){
      if ([mode isEqual:@"select"]) {
        [self.selectedObjects addObject: [self getDataObjects:sectionIndex atRow:rowIndex]];
      } else {
        
        NSMutableArray *tempArray = [self.selectedObjects mutableCopy];

        for (NSArray *selection in self.selectedObjects) {
          NSObject *tempData = [self getDataObjects:sectionIndex atRow:rowIndex];
          
          if ([[tempData valueForKey: @"id"] isEqual:[selection valueForKey: @"id"]]){
              [tempArray removeObject:selection];
          }
        }
        
        self.selectedObjects = tempArray;
      }

      newValue[@"selectedRows"] = self.selectedObjects;
    }
  } else {
    newValue[@"selectedRow"] = [self getDataObjects:sectionIndex atRow:rowIndex];
  }

  if (!(!self.tableView.editing && [mode isEqual:@"deselect"])) {
    [_eventDispatcher sendInputEventWithName:eventName body:newValue];
  }
  
}

- (NSObject*) getDataObjects:(NSNumber *)sectionIndex atRow:(NSNumber *)rowIndex {
  
  NSString *sectionTitle = [self.dataSectionTitles objectAtIndex: [sectionIndex integerValue]];
  
  return [[self.isFiltered
           ? self.filteredTableData
           : self.dataArray objectForKey:sectionTitle] objectAtIndex:[rowIndex integerValue]];
  
}
- (void) resetState {
  self.isFiltered = NO;
  
  [self.tableView setContentOffset:CGPointMake(0, 44) animated:NO];
  [self.searchBar setText: @""];
  [self.searchBar setShowsCancelButton:NO animated:NO];
  [self.searchBar resignFirstResponder];
  [self.tableView reloadData];
}

RCT_NOT_IMPLEMENTED(-initWithFrame:(CGRect)frame)
RCT_NOT_IMPLEMENTED(-initWithCoder:(NSCoder *)aDecoder)

@end