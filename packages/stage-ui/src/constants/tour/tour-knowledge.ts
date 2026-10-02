/**
 * 文旅助手 · 内置目的地知识库
 *
 * 覆盖全国主要旅游城市与热门景点。每条目为压缩速查格式，用于：
 * 1. 注入默认角色卡的系统提示（小游可直接引用作答）；
 * 2. 后续扩展为本地检索（RAG）数据源。
 *
 * 注意：门票价格、开放时间等信息可能随政策调整，答复时提醒用户以官方渠道为准。
 */

export interface TourKnowledgeItem {
  /** 所在城市，如「北京」 */
  city: string
  /** 景点名，如「故宫」 */
  name: string
  /** 速查条目文本 */
  digest: string
  /** 来源：auto=自动沉淀，manual=手动添加（旧数据无此字段视为手动） */
  source?: 'auto' | 'manual'
}

/** 用户知识库总量硬上限，防止长期沉淀无限膨胀 */
export const MAX_USER_KNOWLEDGE_ITEMS = 100

export const TOUR_KNOWLEDGE_ITEMS: TourKnowledgeItem[] = [
  // —— 北京 ——
  { city: '北京', name: '故宫', digest: '明清皇宫紫禁城，世界文化遗产；旺季60元/淡季40元，周一闭馆需提前预约；建议留半天，春秋最佳。' },
  { city: '北京', name: '八达岭长城', digest: '明长城精华段，世界文化遗产；门票40元，可乘缆车/索道，旺季人多建议早出发；最佳春秋。' },
  { city: '北京', name: '颐和园', digest: '清代皇家园林，昆明湖+万寿山；门票30元（联票60元），游船赏景；适合半天，四季皆宜。' },
  { city: '北京', name: '天坛', digest: '明清帝王祭天之所，祈年殿是地标；门票15元（联票34元），公园晨练氛围浓；建议2-3小时。' },
  { city: '北京', name: '中国国家博物馆', digest: '免费需预约，周一闭馆；镇馆之宝后母戊鼎、四羊方尊；建议留半天，馆内禁止带自拍杆。' },
  { city: '北京', name: '环球影城', digest: '全球第五座环球影城，哈利波特园区人气最高；门票按日浮动（约400-700元），建议买优速通、错峰去。' },
  // —— 上海 ——
  { city: '上海', name: '外滩', digest: '万国建筑博览群+黄浦江夜景，免费；与陆家嘴隔江相望，建议傍晚去拍夜景，可坐轮渡。' },
  { city: '上海', name: '上海迪士尼', digest: '大陆首座迪士尼乐园；门票按日浮动（约475-799元），建议下载官方App看排队、抢预约卡。' },
  { city: '上海', name: '豫园', digest: '明代江南园林，紧邻城隍庙小吃街；门票40元；建议顺路逛九曲桥、吃南翔小笼。' },
  // —— 天津 ——
  { city: '天津', name: '五大道', digest: '万国洋楼建筑群，免费漫步，可坐马车观光；建议骑共享单车逛，顺路吃狗不理、煎饼果子。' },
  // —— 西安 ——
  { city: '西安', name: '秦始皇兵马俑', digest: '世界第八大奇迹；门票120元，建议请讲解或租讲解器，游览约3小时；配合华清池一天游。' },
  { city: '西安', name: '大雁塔', digest: '玄奘译经之地，大唐不夜城夜景在此；登塔25元，晚上有音乐喷泉表演（免费）。' },
  { city: '西安', name: '西安城墙', digest: '中国保存最完整的古城墙；门票54元，可租自行车骑一圈约2小时，夜景好看。' },
  { city: '西安', name: '华清宫', digest: '唐玄宗与杨贵妃故事发生地，骊山脚下；门票120元，长恨歌实景演出需另购票。' },
  // —— 成都/乐山/峨眉 ——
  { city: '成都', name: '成都大熊猫繁育研究基地', digest: '看熊猫首选，建议早上8点前到（熊猫上午活跃）；门票55元，观光车可坐。' },
  { city: '成都', name: '都江堰', digest: '两千多年仍在使用的伟大水利工程，世界文化遗产；门票80元，建议请讲解了解原理。' },
  { city: '成都', name: '宽窄巷子', digest: '老成都院落街区，免费；吃喝逛街一体，建议晚上去，顺路吃火锅、兔头。' },
  { city: '乐山', name: '乐山大佛', digest: '世界最大石刻坐佛，通高71米；门票80元，可乘船看全景，登山看细节，建议半天。' },
  { city: '乐山', name: '峨眉山', digest: '佛教四大名山之一，金顶看日出云海；门票160元+观光车，建议2天，注意高海拔温差。' },
  // —— 重庆 ——
  { city: '重庆', name: '洪崖洞', digest: '依山而建的吊脚楼夜景，免费；建议天黑后去，可坐千厮门大桥看全景。' },
  { city: '重庆', name: '武隆天生三桥', digest: '喀斯特天生桥群，《变形金刚》取景地；门票135元含观光车，建议一日游。' },
  { city: '重庆', name: '长江索道', digest: '跨江空中巴士，单程20元；建议傍晚乘坐看两岸夜景，排队高峰慎选。' },
  // —— 杭州 ——
  { city: '杭州', name: '西湖', digest: '世界文化遗产，免费；建议环湖骑行+游船，断桥、苏堤、雷峰塔经典路线，四季皆美。' },
  { city: '杭州', name: '灵隐寺', digest: '千年古刹，飞来峰造像；飞来峰45元+灵隐寺30元香火券；建议早晨去避开人流。' },
  { city: '杭州', name: '西溪湿地', digest: '城市湿地公园，摇橹船体验江南水乡；门票80元含船票，适合休闲半日游。' },
  // —— 苏州 ——
  { city: '苏州', name: '拙政园', digest: '中国四大名园之一，江南园林典范；门票80元，建议请讲解细品造园手法，春秋最佳。' },
  { city: '苏州', name: '虎丘', digest: '“吴中第一名胜”，虎丘塔斜而不倒；门票70元；苏东坡说“到苏州不游虎丘乃憾事”。' },
  { city: '苏州', name: '周庄', digest: '“中国第一水乡”，小桥流水人家；门票100元，建议住一晚看清晨与夜景。' },
  // —— 南京 ——
  { city: '南京', name: '中山陵', digest: '孙中山先生陵寝，免费需预约；392级台阶寓意深刻，建议上午去，顺路游明孝陵（70元）。' },
  { city: '南京', name: '夫子庙秦淮河', digest: '古都文化街区，免费；建议晚上乘秦淮河画舫（约80元），吃鸭血粉丝汤、盐水鸭。' },
  // —— 无锡 ——
  { city: '无锡', name: '鼋头渚', digest: '太湖第一名胜，樱花季（3-4月）绝美；门票90元含船票，可坐船游太湖。' },
  { city: '无锡', name: '灵山大佛', digest: '88米青铜大佛+梵宫，震撼；门票210元，建议留一天，看九龙灌浴演出。' },
  // —— 扬州 ——
  { city: '扬州', name: '瘦西湖', digest: '“两堤花柳全依水”，湖上园林；门票100元，建议半天，春秋最佳，顺路吃早茶。' },
  // —— 广州 ——
  { city: '广州', name: '广州塔', digest: '“小蛮腰”地标，观景台150元起；建议傍晚登塔看珠江夜景，塔下有珠江夜游码头。' },
  { city: '广州', name: '长隆野生动物世界', digest: '亲子必去，可自驾看动物；门票约300元，建议下载App看表演时间表。' },
  { city: '广州', name: '陈家祠', digest: '岭南建筑艺术殿堂，门票10元；建议1-2小时细看木雕石雕砖雕。' },
  // —— 深圳 ——
  { city: '深圳', name: '世界之窗', digest: '微缩世界景观主题公园，门票220元；晚上有烟花/演出，适合打卡拍照。' },
  // —— 珠海 ——
  { city: '珠海', name: '长隆海洋王国', digest: '世界级海洋主题乐园，鲸鲨馆必看；门票约300元，建议一早入园。' },
  // —— 桂林/阳朔 ——
  { city: '桂林', name: '漓江', digest: '“桂林山水甲天下”，精华在兴坪-九马画山段；竹筏/游船约120-300元，建议晴天去。' },
  { city: '桂林', name: '象鼻山', digest: '桂林城徽，免费（部分区域收费）；建议傍晚看夕照，顺路游两江四湖夜游（约185元）。' },
  { city: '阳朔', name: '阳朔西街', digest: '洋人街+山水田园，免费；建议骑行十里画廊、遇龙河竹筏漂流（约160元/筏）。' },
  // —— 三亚 ——
  { city: '三亚', name: '亚龙湾', digest: '“天下第一湾”，沙质细腻，免费沙滩；建议住海边酒店，冬季避寒首选。' },
  { city: '三亚', name: '蜈支洲岛', digest: '潜水胜地，海水清澈；门票+船票约144元，水上项目另计，建议留一天。' },
  // —— 昆明/丽江/大理/西双版纳 ——
  { city: '昆明', name: '石林', digest: '世界自然遗产喀斯特石林；门票130元+电瓶车，建议半天，可顺路游九乡。' },
  { city: '昆明', name: '滇池', digest: '高原明珠，冬季可看红嘴鸥；免费（海埂公园），建议骑行环湖。' },
  { city: '丽江', name: '玉龙雪山', digest: '纳西神山，冰川公园索道旺季需抢票；门票100元+索道140元起，注意高反，建议带氧气。' },
  { city: '丽江', name: '丽江古城', digest: '世界文化遗产，免费；建议住客栈听民谣，清晨人少时最出片，注意古维费政策。' },
  { city: '大理', name: '洱海', digest: '高原湖泊，环湖约130公里；免费（部分景点收费），建议租车环海看苍山洱海日落。' },
  { city: '大理', name: '大理古城', digest: '南诏国都，免费；洋人街+人民路文艺氛围浓，建议慢游。' },
  { city: '西双版纳', name: '中科院热带植物园', digest: '中国最大热带植物园；门票80元+电瓶车，建议留一天，请讲解认识奇花异木。' },
  { city: '西双版纳', name: '告庄西双景', digest: '星光夜市+大金塔，免费；建议晚上逛夜市吃傣味，穿傣装拍照。' },
  // —— 拉萨 ——
  { city: '拉萨', name: '布达拉宫', digest: '世界文化遗产，门票200元（旺季需预约）；建议上午参观，注意高原反应，提前适应。' },
  { city: '拉萨', name: '大昭寺', digest: '藏传佛教圣地，释迦牟尼12岁等身像所在；门票85元，转经道氛围浓厚。' },
  // —— 西北：兰州/敦煌/西宁/新疆 ——
  { city: '兰州', name: '甘肃省博物馆', digest: '免费需预约，铜奔马（马踏飞燕）镇馆；建议2小时，顺路吃牛肉面。' },
  { city: '兰州', name: '黄河铁桥', digest: '“天下黄河第一桥”，免费；建议傍晚看黄河落日，白塔山公园登高。' },
  { city: '敦煌', name: '莫高窟', digest: '世界文化遗产，千年壁画；门票238元（旺季需提前约30天预约），洞窟内禁止拍照。' },
  { city: '敦煌', name: '鸣沙山月牙泉', digest: '沙漠奇观，骆驼骑行；门票110元，建议傍晚进（看日落+星空），注意防晒。' },
  { city: '西宁', name: '青海湖', digest: '中国最大咸水湖，7-8月油菜花海；门票约90元，建议环湖骑行或自驾，注意防风保暖。' },
  { city: '西宁', name: '塔尔寺', digest: '藏传佛教格鲁派六大寺之一，酥油花闻名；门票70元，建议请讲解。' },
  { city: '乌鲁木齐', name: '天山天池', digest: '雪山湖泊，门票95元+区间车；建议一日游，夏季避暑冬季滑雪。' },
  { city: '阿勒泰', name: '喀纳斯', digest: '“人间仙境”，秋季层林尽染；门票160元+区间车，建议2-3天深度游，注意温差大。' },
  // —— 内蒙古/东北 ——
  { city: '呼和浩特', name: '希拉穆仁草原', digest: '距呼市约90公里，草原骑马体验；免费进入（项目另计），建议夏季去，早晚温差大。' },
  { city: '哈尔滨', name: '中央大街', digest: '百年欧式老街，免费；建议冬季去（冰雪大世界+索菲亚教堂拍照），马迭尔冰棍必吃。' },
  { city: '哈尔滨', name: '冰雪大世界', digest: '世界最大冰雪主题乐园；门票约330元（按年浮动），建议晚上去灯光最美，注意保暖。' },
  { city: '沈阳', name: '沈阳故宫', digest: '清朝入关前皇宫，世界文化遗产；门票60元，规模小于北京故宫但特色鲜明。' },
  { city: '大连', name: '棒棰岛', digest: '海滨疗养地，海水清澈；门票20元，建议夏天游泳+散步，顺路游滨海路。' },
  // —— 山东 ——
  { city: '青岛', name: '崂山', digest: '海上第一名山，门票90元起；建议一日游，太清宫+仰口路线经典，海山一色。' },
  { city: '青岛', name: '栈桥', digest: '青岛地标，免费；海鸥翔集，建议秋冬看海鸥，顺路喝原浆啤酒。' },
  { city: '济南', name: '趵突泉', digest: '“天下第一泉”，门票40元；建议春天去，顺路游大明湖（免费）、看泉水人家。' },
  { city: '泰安', name: '泰山', digest: '五岳之首，门票115元；看日出需夜爬或住山顶，建议带登山杖，红门-中天门-南天门经典线。' },
  { city: '曲阜', name: '三孔', digest: '孔庙孔府孔林，世界文化遗产；联票140元，建议请讲解，感受儒家文化。' },
  // —— 河南 ——
  { city: '登封', name: '少林寺', digest: '禅宗祖庭+功夫圣地；门票80元，看武术表演，塔林必游，建议半天。' },
  { city: '洛阳', name: '龙门石窟', digest: '世界文化遗产，卢舍那大佛震撼；门票90元，建议傍晚看灯光，请讲解了解历史。' },
  { city: '洛阳', name: '老君山', digest: '道教名山，金顶道观群；门票100元，云海日出绝美，建议缆车上下，注意天气。' },
  { city: '开封', name: '清明上河园', digest: '以《清明上河图》为蓝本的宋文化主题园；门票120元，看《大宋·东京梦华》实景演出。' },
  // —— 湖北/湖南 ——
  { city: '武汉', name: '黄鹤楼', digest: '江南三大名楼之首；门票70元，登楼望长江，建议傍晚去，顺路吃热干面、看东湖。' },
  { city: '长沙', name: '岳麓山', digest: '免费，爱晚亭+岳麓书院（50元）；建议秋天看红叶，顺路逛橘子洲（免费，看毛主席雕像）。' },
  { city: '长沙', name: '湖南省博物馆', digest: '免费需预约，马王堆汉墓辛追夫人千年不腐；镇馆之宝素纱襌衣，建议提前一周约。' },
  { city: '张家界', name: '张家界国家森林公园', digest: '世界自然遗产，峰林奇观；门票225元（4日有效），袁家界-天子山经典，建议2天。' },
  { city: '张家界', name: '天门山', digest: '天门洞+玻璃栈道，索道世界最长；门票278元含索道，建议早去避人流。' },
  { city: '湘西', name: '凤凰古城', digest: '沈从文笔下的边城，免费入城（小景点收费）；建议住沱江边，看夜景听民谣。' },
  // —— 江西/福建 ——
  { city: '南昌', name: '滕王阁', digest: '江南三大名楼之一，“落霞与孤鹜齐飞”；门票50元，建议傍晚登楼看赣江。' },
  { city: '厦门', name: '鼓浪屿', digest: '世界文化遗产，万国建筑+钢琴文化；船票35元起需预约，建议住一晚慢慢逛。' },
  { city: '泉州', name: '开元寺', digest: '宋元海上丝绸之路遗迹，东西塔是泉州地标；免费，建议半天，顺路吃面线糊。' },
  // —— 安徽 ——
  { city: '黄山', name: '黄山', digest: '世界自然与文化双遗产，“五岳归来不看山”；门票190元，看日出云海需住山顶，建议2天。' },
  { city: '黄山', name: '宏村', digest: '画里乡村，徽派建筑典范；门票104元，建议清晨看南湖倒影，秋季晒秋最美。' },
  // —— 贵州 ——
  { city: '安顺', name: '黄果树瀑布', digest: '亚洲最大瀑布，门票160元含观光车；建议雨季后（6-9月）水量最大，水帘洞体验。' },
  // —— 广西/海南其它 ——
  { city: '南宁', name: '青秀山', digest: '城市绿肺，苏铁园+兰花园；门票20元，适合休闲半日游。' },
  { city: '北海', name: '涠洲岛', digest: '火山岛，鳄鱼山地质公园+五彩滩日出；船票约150元，建议2天，注意看天气。' },
  // —— 宁夏/山西/河北 ——
  { city: '中卫', name: '沙坡头', digest: '黄河+沙漠奇观，滑沙、羊皮筏子；门票100元，建议一天，可顺路玩腾格里沙漠。' },
  { city: '大同', name: '云冈石窟', digest: '世界文化遗产，北魏石刻艺术；门票120元，建议请讲解，半天。' },
  { city: '大同', name: '悬空寺', digest: '建于悬崖的千年古寺；门票15元（登临100元限流），建议早去。' },
  { city: '晋中', name: '平遥古城', digest: '世界文化遗产，明清金融中心；免费入城（景点联票125元），建议住一晚看古城夜色。' },
  { city: '承德', name: '避暑山庄', digest: '清代皇家园林，世界文化遗产；门票130元，建议半天，山庄+外八庙经典。' },
  { city: '秦皇岛', name: '北戴河', digest: '避暑胜地，海滨浴场免费；建议夏季，顺路看山海关（天下第一关，40元）。' },
  // —— 浙江 ——
  { city: '绍兴', name: '鲁迅故里', digest: '免费，从百草园到三味书屋；建议半天，顺路坐乌篷船、喝黄酒吃茴香豆。' },
  { city: '舟山', name: '普陀山', digest: '佛教四大名山之一，观音道场；门票160元+船票，建议2天，看南海观音像。' },
  // —— 潮汕（用户所在地） ——
  { city: '潮州', name: '广济桥', digest: '中国四大古桥之一，每天有“过河拆桥”浮桥开合表演（约10点/16点）；门票20元，建议黄昏看灯光秀。' },
  { city: '潮州', name: '牌坊街', digest: '23座明清石牌坊，免费；建议白天逛老字号（春卷、蚝烙、牛肉丸），晚上看灯光。' },
  { city: '潮州', name: '开元寺', digest: '粤东名刹，唐代始建；免费，建议顺路游甲第巷、己略黄公祠看潮州木雕。' },
  { city: '汕头', name: '南澳岛', digest: '广东最美海岛之一，跨海大桥进岛；免费，建议自驾环岛，看北回归线标志塔、吃海鲜。' },
  // —— 广东其它 ——
  { city: '佛山', name: '祖庙', digest: '岭南建筑+黄飞鸿纪念馆+舞狮表演；门票20元，建议上午看醒狮表演。' },
  { city: '惠州', name: '罗浮山', digest: '岭南第一名山，道教圣地；门票54元，建议一天，可泡温泉。' },
  { city: '肇庆', name: '七星岩', digest: '喀斯特湖岩景观，门票78元；建议半天，星湖游船+石室岩探洞。' },
]

/** 将知识库渲染为注入系统提示的速查文本 */
export function buildTourKnowledgeDigest(items: TourKnowledgeItem[] = TOUR_KNOWLEDGE_ITEMS): string {
  return items
    .map(item => `- ${item.city}·${item.name}：${item.digest}`)
    .join('\n')
}

// —— 用户自定义知识库（UI 可编辑，localStorage 持久化） ——

export const USER_KNOWLEDGE_KEY = 'tour/knowledge/user-items'
export const USER_INSTRUCTION_KEY = 'tour/knowledge/user-instruction'
export const AUTO_SEDIMENT_KEY = 'tour/knowledge/auto-sediment'
export const AUTO_SEDIMENT_ENABLED = true

/** 长期记忆自动沉淀开关是否开启（设置-记忆-长期记忆 页可改） */
export function isAutoSedimentEnabled(): boolean {
  try {
    return localStorage.getItem(AUTO_SEDIMENT_KEY) !== 'off'
  }
  catch {
    return true
  }
}

/** 将一条回复沉淀为知识条目：digest 取包含景点名的那句话（截前 100 字） */
function extractSentence(reply: string, name: string): string {
  const idx = reply.indexOf(name)
  if (idx < 0)
    return ''
  const start = Math.max(0, idx - 40)
  let end = reply.indexOf('。', idx)
  if (end < 0)
    end = reply.indexOf('！', idx)
  if (end < 0)
    end = reply.indexOf('？', idx)
  if (end < 0)
    end = reply.indexOf('\n', idx)
  if (end < 0 || end > idx + 120)
    end = Math.min(reply.length, idx + name.length + 60)
  return reply.slice(start, end + 1).trim().slice(0, 100)
}

/**
 * 长期记忆自动沉淀：扫描助手回复，把内置知识库中提及的景点（尚未收录在
 * 用户自定义库的）自动追加进去，形成跨会话持续有效的长期记忆。
 * 防重复：同名同城市已存在则跳过；每轮最多沉淀 3 条，避免刷屏。
 */
export function sedimentKnowledgeFromReply(reply: string): number {
  if (!isAutoSedimentEnabled() || !reply)
    return 0
  // 清洗 LLM 控制标记（<|emotion|> 等）与 JSON 元数据尾巴，避免沉淀进知识库
  const clean = reply.replace(/<\|[^|]*\|>/g, '').replace(/\{[^{}]*\}/g, '')
  if (!clean.trim())
    return 0
  const existing = readUserKnowledgeItems()
  const existingKeys = new Set(existing.map(it => `${it.city}·${it.name}`))
  const added: TourKnowledgeItem[] = []

  for (const item of TOUR_KNOWLEDGE_ITEMS) {
    if (added.length >= 3)
      break
    const key = `${item.city}·${item.name}`
    if (existingKeys.has(key))
      continue
    // 城市+景点双命中才沉淀，避免同名景点错配城市（如潮州开元寺≠泉州开元寺）
    if (!clean.includes(item.city) || !clean.includes(item.name))
      continue
    const digest = extractSentence(clean, item.name) || `（自动沉淀）${item.city}·${item.name}`
    added.push({ city: item.city, name: item.name, digest, source: 'auto' })
  }

  if (added.length === 0)
    return 0
  try {
    const merged = [...existing, ...added].map(it => ({ ...it, source: it.source ?? 'manual' as const }))
    // 总量硬上限：超出时保留最新的条目（含本轮新增）
    const capped = merged.length > MAX_USER_KNOWLEDGE_ITEMS ? merged.slice(-MAX_USER_KNOWLEDGE_ITEMS) : merged
    localStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(capped))
  }
  catch {
    return 0
  }
  return added.length
}

/** 统计用户知识库中「自动沉淀」来源的条目数 */
export function countAutoKnowledgeItems(): number {
  return readUserKnowledgeItems().filter(it => it.source === 'auto').length
}

/** 一键清空全部「自动沉淀」条目（保留手动添加） */
export function clearAutoKnowledgeItems(): number {
  const items = readUserKnowledgeItems()
  const kept = items.filter(it => it.source !== 'auto')
  try {
    localStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(kept))
  }
  catch {
    return 0
  }
  return items.length - kept.length
}

/** 读取用户自定义知识条目（设置-知识库 页面写入） */
export function readUserKnowledgeItems(): TourKnowledgeItem[] {
  try {
    const raw = localStorage.getItem(USER_KNOWLEDGE_KEY)
    if (!raw)
      return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed))
      return []
    return parsed.filter((it): it is TourKnowledgeItem =>
      !!it && typeof it.city === 'string' && typeof it.name === 'string' && typeof it.digest === 'string')
  }
  catch {
    return []
  }
}

/** 将用户自定义知识渲染为注入系统提示的速查文本（空则不注入） */
export function buildUserKnowledgeDigest(): string {
  const items = readUserKnowledgeItems()
  if (items.length === 0)
    return ''
  return items
    .map(item => `- ${item.city}·${item.name}：${item.digest}`)
    .join('\n')
}

export interface KnowledgeHit {
  item: TourKnowledgeItem
  /** 检索相关性分（城市/景点直接命中权重最高） */
  score: number
}

/**
 * 知识库检索（轻量 RAG）：对内置速查 + 用户自定义合并打分检索。
 * 打分规则：城市名/景点名整体命中 +10，摘要包含关键词 +3；
 * 查询分词后（2 字以上）每词命中城市/景点 +4、摘要 +1；得分 > 0 才返回。
 * 同名同城条目用户自定义优先（后写覆盖内置）。
 */
export function searchTourKnowledge(query: string, limit = 10): KnowledgeHit[] {
  const q = query.trim().toLowerCase()
  if (!q)
    return []
  const seen = new Set<string>()
  const hits: KnowledgeHit[] = []

  for (const item of [...readUserKnowledgeItems(), ...TOUR_KNOWLEDGE_ITEMS]) {
    const key = `${item.city}·${item.name}`
    if (seen.has(key))
      continue
    seen.add(key)

    const city = item.city.toLowerCase()
    const name = item.name.toLowerCase()
    const digest = (item.digest || '').toLowerCase()
    let score = 0

    if (city.includes(q))
      score += 10
    if (name.includes(q))
      score += 10
    if (digest.includes(q))
      score += 3

    for (const term of q.split(/[\s,，。、!?！？]+/).filter(Boolean)) {
      if (term.length < 2)
        continue
      if (city.includes(term))
        score += 4
      if (name.includes(term))
        score += 4
      if (digest.includes(term))
        score += 1
    }

    if (score > 0)
      hits.push({ item, score })
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}

/** 按用户问题检索并渲染注入文本；无命中时回退为全部用户自定义知识 */
export function buildRelevantKnowledgeDigest(query: string, limit = 10): string {
  const hits = searchTourKnowledge(query, limit)
  if (hits.length === 0)
    return buildUserKnowledgeDigest()
  return hits.map(hit => `- ${hit.item.city}·${hit.item.name}：${hit.item.digest}`).join('\n')
}

/** 读取用户附加指令（设置-知识库 页面写入，追加到系统提示末尾） */
export function readUserInstruction(): string {
  try {
    return localStorage.getItem(USER_INSTRUCTION_KEY) ?? ''
  }
  catch {
    return ''
  }
}

/** 注入默认角色卡系统提示的文旅知识指令 + 速查表 */
export const TOUR_SYSTEM_PROMPT = `## 职责
你是文旅助手「小游」，一位专业亲切的 AI 文旅导游。回答用户的旅行问题，覆盖景点介绍、行程规划、美食推荐、实用贴士。
始终以「小游」身份回应：自我介绍只说自己是文旅助手小游，禁止暴露底层模型名称、厂商、版本号（如 u2、agnes、GPT、DeepSeek 等字样），用户问"你是谁/什么模型"时同样只答小游。

## 内置目的地知识库（速查）
以下是你掌握的主要目的地速查信息，回答相关问题时优先引用：

${buildTourKnowledgeDigest()}

## 回答规范
1. 先给结论，再给细节；条理清晰，语气热情亲切。
2. 门票价格、开放时间、预约政策等动态信息可能调整，引用后请提醒「以景区官方渠道为准」；切勿编造。
3. 涉及实时天气、车次航班、当日客流等时效信息时，建议用户开启联网搜索或查询官方渠道，不要编造具体数值。
4. 行程规划请先了解用户的天数、预算、同行人、出发地和兴趣，再给方案。
5. 不知道的就如实说不知道，不要硬答。

## 输出红线（必须遵守）
1. 只输出给用户看的正文，禁止在正文中出现 <|...|>、{{...}}、{emotion:...}、<emotion> 等任何控制/标记语法；想表达情绪直接用自然语言（如「哈哈」「真不错」）。
2. 用中文回答；除专有名词外不要夹带英文。
3. 不重复已经说过的内容，不绕圈；同一句话不说两遍。
4. 结尾不要附加 JSON、XML、Markdown 代码块包裹的元数据。
5. 不要输出「好的，我来回答」「以下是回答」之类的开场白。`
