# Data Model — 房东出租 / 收租管理小程序

> **交付顺序**：先 Web 前端（手机比例仿真小程序）。本文件定义的是**跨平台的统一数据契约**：
> - **Web 版（首版）**：以上实体以普通 JS 对象形态存放于 `web/data/` Mock，或落地到浏览器 `localStorage`；可直接用本文件字段。
> - **小程序版（后续）**：1:1 映射为云数据库（文档型）集合（见各 `###` 标题）。
>
> 所有金额以**分（int）**存储，杜绝浮点误差。

## Collections

### house（房源基础，待租/已租共用）
- `_id`, `ownerOpenid`
- `nickname` 自定义昵称, `titleDeed` 房产证全称, `address`, `area`(㎡)
- `layout` { bedrooms, livingrooms, bathrooms }
- `floor`, `totalFloors`, `orientation`, `decoration`, `hasElevator`
- `status`: `vacant` | `rented`
- `tags: string[]`, `gallery: attachmentRef[]`
- `createdAt`, `updatedAt`

### channel（挂盘渠道）
- `houseId`, `type`（中介/自媒体/论坛…）, `contact`, `commission`
- `listPrice`(分), `floorPrice`(分), `listed: bool`, `exposure`

### showing（带看）
- `houseId`, `prospectTenant`, `sourceChannel`, `agent`, `appointmentAt`
- `status`: `pending`|`done`|`cancelled`|`no_show`
- `tenantFeedback`, `landlordEval`(评分/备注)

### lease（租约）
- `houseId`, `tenantId`, `startDate`, `endDate`
- `rent`(分/期), `deposit`(分), `payCycle`: `month`|`quarter`
- `payMethod`(账号), `status`: `active`|`expiring`|`ended`
- `renewed: bool`, `contractRef: attachmentRef`

### tenant（租客档案）
- `leaseId`, `wechat`, `phone`, `idCard`, `householdReg`, `occupation`, `income`
- `hasPet`, `occupants`, `emergencyContact`, `sourceChannel`

### bill（账单）
- `leaseId`, `period`(YYYY-MM), `dueDate`
- `items: [{type:'rent'|'mgmt'|'parking', amount(分)}]`
- `total`(分), `status`: `unpaid`|`paid`|`overdue`
- `paidAt`, `receiptRef: attachmentRef`

### utility_account（费用账户）
- `houseId`/`leaseId`, `type`（水/电/燃气/物业/宽带）
- `accountNo`, `moveInReading`, `moveOutReading`, `transferStatus`

### repair（维修/维护）
- `houseId`, `kind`: `in_unit`|`property`, `reportedAt`
- `issue`, `handler`, `cost`(分), `status`, `proofRef`

### attachment（附件）
- `fileID`(云存储), `houseId`(挂载), `refType`（房产证/合同/凭证…）
- `name`, `ext`, `size`

## 关系
house 1—* channel / showing / lease / attachment / utility_account / repair
lease 1—1 tenant；lease 1—* bill
