# 用户API

<cite>
**本文档引用的文件**   
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts)
- [appPrivacyManager.ts](file://src/lib/appManagers/appPrivacyManager.ts)
- [appProfileManager.ts](file://src/lib/appManagers/appProfileManager.ts)
- [appPeersManager.ts](file://src/lib/appManagers/appPeersManager.ts)
- [appAvatarsManager.ts](file://src/lib/appManagers/appAvatarsManager.ts)
- [appUsernamesManager.ts](file://src/lib/appManagers/appUsernamesManager.ts)
- [getPeerActiveUsernames.ts](file://src/lib/appManagers/utils/peers/getPeerActiveUsernames.ts)
- [canSendToUser.ts](file://src/lib/appManagers/utils/users/canSendToUser.ts)
</cite>

## 目录
1. [简介](#简介)
2. [用户数据模型](#用户数据模型)
3. [用户信息获取API](#用户信息获取api)
4. [联系人管理API](#联系人管理api)
5. [用户状态更新机制](#用户状态更新机制)
6. [用户搜索与发现](#用户搜索与发现)
7. [用户头像管理](#用户头像管理)
8. [用户名管理](#用户名管理)
9. [在线状态管理](#在线状态管理)
10. [用户隐私设置与可见性控制](#用户隐私设置与可见性控制)
11. [用户关系链与好友请求](#用户关系链与好友请求)

## 简介

本文档全面记录了用户API的详细功能，包括用户信息获取、联系人管理、用户状态更新等核心接口。文档详细描述了用户数据模型，包括用户属性、关系和权限系统。同时，说明了用户搜索和发现功能的实现方式，解释了用户头像、用户名和在线状态的管理机制，并提供了用户隐私设置和可见性控制的API使用指南。最后，文档包含了用户关系链处理和好友请求的完整流程说明。

**Section sources**
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L1-L800)
- [appPrivacyManager.ts](file://src/lib/appManagers/appPrivacyManager.ts#L1-L118)

## 用户数据模型

用户数据模型是整个用户系统的核心，包含了用户的基本信息、状态、权限和关系。用户对象（User）包含以下主要属性：

- **基本属性**：`id`、`first_name`、`last_name`、`username`、`phone`
- **状态属性**：`status`（用户在线状态）
- **权限标志**：`pFlags` 对象，包含 `bot`、`premium`、`verified`、`scam`、`fake`、`contact`、`mutual_contact` 等布尔值
- **扩展属性**：`emoji_status`（表情状态）、`photo`（用户头像）、`usernames`（多个用户名）

用户通过 `PeerId` 进行标识，`PeerId` 可以是用户（user）或聊天（chat）的标识符。用户与聊天通过 `appPeersManager` 进行统一管理。

```mermaid
classDiagram
class User {
+id : UserId
+first_name : string
+last_name : string
+username : string
+phone : string
+status : UserStatus
+pFlags : UserFlags
+emoji_status : EmojiStatus
+photo : UserProfilePhoto
+usernames : Username[]
}
class UserFlags {
+bot : boolean
+premium : boolean
+verified : boolean
+scam : boolean
+fake : boolean
+contact : boolean
+mutual_contact : boolean
+self : boolean
}
class PeerId {
+toUserId() : UserId
+toChatId() : ChatId
+isUser() : boolean
+isAnyChat() : boolean
}
class AppUsersManager {
-users : Map<UserId, User>
-usernames : Map<string, PeerId>
-contactsList : Set<UserId>
+getUser(id : UserId) : User
+getSelf() : User
+isContact(id : UserId) : boolean
+isPremium(id : UserId) : boolean
+isBot(id : UserId) : boolean
}
class AppPeersManager {
+getPeer(peerId : PeerId) : User | Chat
+getPeerId(peerId : PeerId) : PeerId
+isUser(peerId : PeerId) : boolean
+isContact(peerId : PeerId) : boolean
}
User --> UserFlags : "包含"
AppUsersManager --> User : "管理"
AppPeersManager --> User : "获取"
AppPeersManager --> AppUsersManager : "依赖"
```

**Diagram sources **
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L35-L800)
- [appPeersManager.ts](file://src/lib/appManagers/appPeersManager.ts#L28-L371)

**Section sources**
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L35-L800)
- [appPeersManager.ts](file://src/lib/appManagers/appPeersManager.ts#L28-L371)

## 用户信息获取API

用户信息获取API提供了多种方式来获取用户数据，包括单个用户、多个用户和用户完整资料的获取。

### 获取单个用户信息

通过 `getUser` 方法可以获取指定用户ID的用户信息。该方法会从本地缓存中返回用户对象，如果用户信息不存在，则返回 `undefined`。

```mermaid
sequenceDiagram
participant Client as "客户端"
participant AppUsersManager as "AppUsersManager"
Client->>AppUsersManager : getUser(userId)
AppUsersManager-->>Client : 返回用户对象或undefined
```

**Diagram sources **
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L726-L732)

### 获取多个用户信息

通过 `getApiUsers` 方法可以从服务器批量获取多个用户的信息。该方法会调用 `users.getUsers` API，并将返回的用户数据保存到本地缓存中。

```mermaid
sequenceDiagram
participant Client as "客户端"
participant AppUsersManager as "AppUsersManager"
participant ApiManager as "ApiManager"
Client->>AppUsersManager : getApiUsers(userIds)
AppUsersManager->>ApiManager : invokeApi('users.getUsers', {id : userIds})
ApiManager-->>AppUsersManager : 返回用户数组
AppUsersManager->>AppUsersManager : saveApiUsers(users)
AppUsersManager-->>Client : 返回用户数组
```

**Diagram sources **
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L742-L748)

### 获取用户完整资料

通过 `getProfile` 方法可以获取用户的完整资料（UserFull），包括用户的个人简介、关联的聊天、通知设置等详细信息。该方法会缓存结果，避免频繁请求。

```mermaid
sequenceDiagram
participant Client as "客户端"
participant AppProfileManager as "AppProfileManager"
participant ApiManager as "ApiManager"
Client->>AppProfileManager : getProfile(userId)
alt 缓存存在且未过期
AppProfileManager-->>Client : 返回缓存的用户完整资料
else 缓存不存在或已过期
AppProfileManager->>ApiManager : invokeApi('users.getFullUser', {id : userInput})
ApiManager-->>AppProfileManager : 返回用户完整资料
AppProfileManager->>AppProfileManager : 保存到缓存
AppProfileManager-->>Client : 返回用户完整资料
end
```

**Diagram sources **
- [appProfileManager.ts](file://src/lib/appManagers/appProfileManager.ts#L125-L177)

**Section sources**
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L726-L753)
- [appProfileManager.ts](file://src/lib/appManagers/appProfileManager.ts#L125-L177)

## 联系人管理API

联系人管理API提供了添加、删除、查询联系人以及处理联系人列表的功能。

### 获取联系人列表

`getContacts` 方法用于获取用户的联系人列表。该方法会首先填充联系人列表，然后根据查询条件进行过滤和排序。

```mermaid
flowchart TD
Start([开始]) --> FillContacts["填充联系人列表"]
FillContacts --> CheckQuery{"是否有查询条件?"}
CheckQuery --> |是| Search["使用搜索索引进行搜索"]
CheckQuery --> |否| Sort["根据排序方式排序"]
Search --> Sort
Sort --> RemoveSelf["移除当前用户"]
RemoveSelf --> IncludeSaved{"包含保存的消息?"}
IncludeSaved --> |是| AddSelf["将当前用户添加到列表开头"]
IncludeSaved --> |否| ReturnResult["返回结果"]
AddSelf --> ReturnResult
ReturnResult --> End([结束])
```

**Diagram sources **
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L402-L449)

### 添加联系人

通过 `addContact` 方法可以将用户添加为联系人。该方法会调用 `contacts.addContact` API，并更新本地缓存。

```mermaid
sequenceDiagram
participant Client as "客户端"
participant AppUsersManager as "AppUsersManager"
participant ApiManager as "ApiManager"
Client->>AppUsersManager : addContact(contact)
AppUsersManager->>ApiManager : invokeApi('contacts.addContact', {contact})
ApiManager-->>AppUsersManager : 返回结果
AppUsersManager->>AppUsersManager : 更新本地缓存
AppUsersManager-->>Client : 返回结果
```

### 删除联系人

通过 `deleteContact` 方法可以将用户从联系人列表中删除。该方法会调用 `contacts.deleteContact` API，并更新本地缓存。

```mermaid
sequenceDiagram
participant Client as "客户端"
participant AppUsersManager as "AppUsersManager"
participant ApiManager as "ApiManager"
Client->>AppUsersManager : deleteContact(userId)
AppUsersManager->>ApiManager : invokeApi('contacts.deleteContact', {id : userInput})
ApiManager-->>AppUsersManager : 返回结果
AppUsersManager->>AppUsersManager : 更新本地缓存
AppUsersManager-->>Client : 返回结果
```

**Section sources**
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L298-L333)
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L372-L382)

## 用户状态更新机制

用户状态更新机制负责处理用户在线状态、用户名、表情状态等信息的更新。

### 在线状态更新

当收到 `updateUserStatus` 更新时，`AppUsersManager` 会更新用户的状态信息，并触发相应的事件。

```mermaid
sequenceDiagram
participant Update as "更新"
participant AppUsersManager as "AppUsersManager"
participant RootScope as "rootScope"
Update->>AppUsersManager : updateUserStatus(update)
AppUsersManager->>AppUsersManager : 更新用户状态
AppUsersManager->>AppUsersManager : 保存用户状态
AppUsersManager->>RootScope : dispatchEvent('user_update', userId)
AppUsersManager->>AppUsersManager : setUserToStateIfNeeded(user)
```

**Diagram sources **
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L77-L90)

### 用户名更新

当收到 `updateUserName` 更新时，`AppUsersManager` 会更新用户的姓名和用户名信息。

```mermaid
sequenceDiagram
participant Update as "更新"
participant AppUsersManager as "AppUsersManager"
Update->>AppUsersManager : updateUserName(update)
AppUsersManager->>AppUsersManager : forceUserOnline(userId)
AppUsersManager->>AppUsersManager : saveApiUser({...user, first_name, last_name, usernames})
```

**Diagram sources **
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L115-L130)

### 表情状态更新

当收到 `updateUserEmojiStatus` 更新时，`AppUsersManager` 会更新用户的表情状态。

```mermaid
sequenceDiagram
participant Update as "更新"
participant AppUsersManager as "AppUsersManager"
Update->>AppUsersManager : updateUserEmojiStatus(update)
AppUsersManager->>AppUsersManager : forceUserOnline(userId)
AppUsersManager->>AppUsersManager : saveApiUser({...user, emoji_status})
```

**Section sources**
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L77-L150)

## 用户搜索与发现

用户搜索与发现功能通过搜索索引实现，支持对用户姓名、电话、用户名等信息的模糊搜索。

### 搜索索引创建

`createSearchIndex` 方法创建一个搜索索引，用于存储和搜索用户信息。

```mermaid
flowchart TD
Start([开始]) --> CreateIndex["创建搜索索引"]
CreateIndex --> SetOptions["设置搜索选项"]
SetOptions --> DefineOptions["ignoreCase: true<br/>latinize: true<br/>clearBadChars: true"]
DefineOptions --> ReturnIndex["返回搜索索引"]
ReturnIndex --> End([结束])
```

**Diagram sources **
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L493-L495)

### 用户搜索实现

用户搜索通过 `getContacts` 方法实现，该方法使用搜索索引对联系人列表进行过滤。

```mermaid
flowchart TD
Start([开始]) --> GetContactsList["获取联系人列表"]
GetContactsList --> CheckQuery{"是否有查询条件?"}
CheckQuery --> |是| CreateIndex["创建搜索索引"]
CheckQuery --> |否| SortList["根据排序方式排序"]
CreateIndex --> IndexContacts["为每个联系人建立索引"]
IndexContacts --> Search["执行搜索"]
Search --> FilterList["过滤联系人列表"]
FilterList --> SortList
SortList --> ReturnResult["返回结果"]
ReturnResult --> End([结束])
```

**Diagram sources **
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L402-L449)

**Section sources**
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L39-L45)
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L402-L449)

## 用户头像管理

用户头像管理由 `AppAvatarsManager` 负责，提供了头像的加载、缓存和更新功能。

### 头像加载流程

```mermaid
sequenceDiagram
participant Client as "客户端"
participant AppAvatarsManager as "AppAvatarsManager"
participant ApiFileManager as "ApiFileManager"
Client->>AppAvatarsManager : loadAvatar(peerId, photo, size)
AppAvatarsManager->>AppAvatarsManager : 检查缓存
alt 缓存存在
AppAvatarsManager-->>Client : 返回缓存的URL
else 缓存不存在
AppAvatarsManager->>ApiFileManager : download(downloadOptions)
ApiFileManager-->>AppAvatarsManager : 返回Blob
AppAvatarsManager->>AppAvatarsManager : 创建ObjectURL
AppAvatarsManager->>AppAvatarsManager : 保存到缓存
AppAvatarsManager-->>Client : 返回URL
end
```

**Diagram sources **
- [appAvatarsManager.ts](file://src/lib/appManagers/appAvatarsManager.ts#L52-L84)

### 头像更新机制

当用户头像更新时，`AppAvatarsManager` 会收到 `avatar_update` 事件，并清除相应的缓存。

```mermaid
flowchart TD
Start([开始]) --> ReceiveEvent["收到avatar_update事件"]
ReceiveEvent --> CheckThreadId{"是否有threadId?"}
CheckThreadId --> |是| End([结束])
CheckThreadId --> |否| RemoveCache["从缓存中移除头像"]
RemoveCache --> NotifyPort["通知MessagePort"]
NotifyPort --> End([结束])
```

**Diagram sources **
- [appAvatarsManager.ts](file://src/lib/appManagers/appAvatarsManager.ts#L23-L29)

**Section sources**
- [appAvatarsManager.ts](file://src/lib/appManagers/appAvatarsManager.ts#L15-L87)

## 用户名管理

用户名管理由 `AppUsernamesManager` 负责，提供了用户名的激活、停用和重新排序功能。

### 激活/停用用户名

`toggleUsername` 方法用于激活或停用用户名。根据 `peerId` 的不同，该方法会调用不同的API。

```mermaid
flowchart TD
Start([开始]) --> CheckPeerId{"peerId是否为空或为当前用户?"}
CheckPeerId --> |是| CallAccount["调用account.toggleUsername"]
CheckPeerId --> |否| CheckIsChat{"peerId是否为聊天?"}
CheckIsChat --> |是| CallChannels["调用channels.toggleUsername"]
CheckIsChat --> |否| CallBots["调用bots.toggleUsername"]
CallAccount --> ReturnResult["返回结果"]
CallChannels --> RefreshChat["刷新聊天"]
RefreshChat --> ReturnResult
CallBots --> ReturnResult
ReturnResult --> End([结束])
```

**Diagram sources **
- [appUsernamesManager.ts](file://src/lib/appManagers/appUsernamesManager.ts#L10-L37)

### 重新排序用户名

`reorderUsernames` 方法用于重新排序用户名。与 `toggleUsername` 类似，该方法会根据 `peerId` 调用不同的API。

```mermaid
flowchart TD
Start([开始]) --> CheckPeerId{"peerId是否为空或为当前用户?"}
CheckPeerId --> |是| CallAccount["调用account.reorderUsernames"]
CheckPeerId --> |否| CheckIsChat{"peerId是否为聊天?"}
CheckIsChat --> |是| CallChannels["调用channels.reorderUsernames"]
CheckIsChat --> |否| CallBots["调用bots.reorderUsernames"]
CallAccount --> ReturnResult["返回结果"]
CallChannels --> RefreshChat["刷新聊天"]
RefreshChat --> ReturnResult
CallBots --> ReturnResult
ReturnResult --> End([结束])
```

**Diagram sources **
- [appUsernamesManager.ts](file://src/lib/appManagers/appUsernamesManager.ts#L39-L63)

**Section sources**
- [appUsernamesManager.ts](file://src/lib/appManagers/appUsernamesManager.ts#L9-L64)

## 在线状态管理

在线状态管理负责处理用户的在线状态显示和排序。

### 在线状态判断

`getUserStatusForSort` 方法用于获取用户状态的排序值，该值用于联系人列表的排序。

```mermaid
flowchart TD
Start([开始]) --> CheckStatusType{"状态类型?"}
CheckStatusType --> |userStatusOnline| ReturnExpires["返回expires值"]
CheckStatusType --> |userStatusOffline| ReturnWasOnline["返回was_online值"]
CheckStatusType --> |userStatusRecently| Return3["返回3"]
CheckStatusType --> |userStatusLastWeek| Return2["返回2"]
CheckStatusType --> |userStatusLastMonth| Return1["返回1"]
CheckStatusType --> |其他| Return0["返回0"]
ReturnExpires --> End([结束])
ReturnWasOnline --> End
Return3 --> End
Return2 --> End
Return1 --> End
Return0 --> End
```

**Diagram sources **
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L692-L724)

### 在线可见性判断

`isUserOnlineVisible` 方法用于判断用户是否在线可见。

```mermaid
flowchart TD
Start([开始]) --> GetStatus["获取用户状态"]
GetStatus --> GetSortValue["获取排序值"]
GetSortValue --> CheckValue{"排序值 > 3?"}
CheckValue --> |是| ReturnTrue["返回true"]
CheckValue --> |否| ReturnFalse["返回false"]
ReturnTrue --> End([结束])
ReturnFalse --> End
```

**Section sources**
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L688-L690)
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L692-L724)

## 用户隐私设置与可见性控制

用户隐私设置与可见性控制由 `AppPrivacyManager` 负责，提供了隐私规则的设置和获取功能。

### 隐私规则设置

`setPrivacy` 方法用于设置用户的隐私规则。该方法会调用 `account.setPrivacy` API，并更新本地缓存。

```mermaid
sequenceDiagram
participant Client as "客户端"
participant AppPrivacyManager as "AppPrivacyManager"
participant ApiManager as "ApiManager"
Client->>AppPrivacyManager : setPrivacy(inputKey, rules)
AppPrivacyManager->>ApiManager : invokeApi('account.setPrivacy', {key, rules})
ApiManager-->>AppPrivacyManager : 返回隐私规则
AppPrivacyManager->>AppUsersManager : saveApiUsers(privacyRules.users)
AppPrivacyManager->>AppChatsManager : saveApiChats(privacyRules.chats)
AppPrivacyManager->>ApiUpdatesManager : processLocalUpdate(updatePrivacy)
AppPrivacyManager-->>Client : 返回规则
```

**Diagram sources **
- [appPrivacyManager.ts](file://src/lib/appManagers/appPrivacyManager.ts#L33-L59)

### 隐私规则获取

`getPrivacy` 方法用于获取用户的隐私规则。该方法会先检查本地缓存，如果缓存不存在则从服务器获取。

```mermaid
flowchart TD
Start([开始]) --> CheckCache{"缓存是否存在?"}
CheckCache --> |是| ReturnCache["返回缓存的规则"]
CheckCache --> |否| CallApi["调用account.getPrivacy"]
CallApi --> SaveUsers["保存用户到缓存"]
SaveUsers --> SaveChats["保存聊天到缓存"]
SaveChats --> SaveCache["保存规则到缓存"]
SaveCache --> ReturnResult["返回规则"]
ReturnCache --> End([结束])
ReturnResult --> End
```

**Diagram sources **
- [appPrivacyManager.ts](file://src/lib/appManagers/appPrivacyManager.ts#L62-L80)

### 内容可见性设置

`setContentSettings` 方法用于设置内容可见性，如敏感内容的显示。

```mermaid
sequenceDiagram
participant Client as "客户端"
participant AppPrivacyManager as "AppPrivacyManager"
participant ApiManager as "ApiManager"
Client->>AppPrivacyManager : setContentSettings(settings)
AppPrivacyManager->>ApiManager : invokeApi('account.setContentSettings', settings)
ApiManager-->>AppPrivacyManager : 完成
AppPrivacyManager->>ApiManager : getAppConfig(true)
AppPrivacyManager->>AppPrivacyManager : getContentSettings(true)
AppPrivacyManager-->>Client : 完成
```

**Section sources**
- [appPrivacyManager.ts](file://src/lib/appManagers/appPrivacyManager.ts#L33-L117)

## 用户关系链与好友请求

用户关系链与好友请求功能通过联系人管理和隐私设置实现。

### 好友请求流程

好友请求的完整流程包括添加联系人、处理隐私设置和更新本地状态。

```mermaid
sequenceDiagram
participant UserA as "用户A"
participant UserB as "用户B"
participant AppUsersManager as "AppUsersManager"
participant ApiManager as "ApiManager"
UserA->>AppUsersManager : 请求添加UserB为联系人
AppUsersManager->>ApiManager : invokeApi('contacts.addContact', {contact})
ApiManager-->>AppUsersManager : 返回结果
AppUsersManager->>AppUsersManager : 更新本地缓存
AppUsersManager->>AppUsersManager : pushContact(userId)
AppUsersManager->>UserB : 收到updateContactLink更新
UserB->>AppUsersManager : 处理联系人更新
AppUsersManager->>AppUsersManager : onContactUpdated(userId, isContact)
AppUsersManager->>UserA : 好友请求成功
```

### 好友关系管理

好友关系的管理通过 `isContact` 方法实现，该方法检查用户是否在联系人列表中。

```mermaid
flowchart TD
Start([开始]) --> CheckInList["检查用户ID是否在contactsList中"]
CheckInList --> CheckUserFlags{"用户pFlags.contact是否为true?"}
CheckInList --> |是| ReturnTrue["返回true"]
CheckUserFlags --> |是| ReturnTrue
CheckUserFlags --> |否| ReturnFalse["返回false"]
ReturnTrue --> End([结束])
ReturnFalse --> End
```

**Section sources**
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L767-L769)
- [appUsersManager.ts](file://src/lib/appManagers/appUsersManager.ts#L372-L382)