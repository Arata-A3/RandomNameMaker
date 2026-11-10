import { entries } from './parse';

/** 中華風の姓（日本の字体で表記、読みはピンイン） */
export const CN_FAMILY = entries(`
王:wang 李:li 張:zhang 劉:liu 陳:chen 楊:yang 黄:huang 趙:zhao 呉:wu 周:zhou 徐:xu 孫:sun 馬:ma 朱:zhu 胡:hu
郭:guo 何:he 林:lin 高:gao 羅:luo 鄭:zheng 梁:liang 謝:xie 宋:song 唐:tang 許:xu 韓:han 馮:feng 鄧:deng 曹:cao
彭:peng 曾:zeng 蕭:xiao 田:tian 董:dong 潘:pan 袁:yuan 蔡:cai 蒋:jiang 余:yu 杜:du 葉:ye 程:cheng 魏:wei 蘇:su
呂:lü 丁:ding 任:ren 沈:shen 姚:yao 盧:lu 姜:jiang 崔:cui 鍾:zhong 譚:tan 陸:lu 汪:wang 范:fan 金:jin 石:shi
廖:liao 賈:jia 夏:xia 韋:wei 方:fang 白:bai 鄒:zou 孟:meng 熊:xiong 秦:qin 邱:qiu 江:jiang 尹:yin 薛:xue 段:duan
雷:lei 侯:hou 龍:long 史:shi 陶:tao 黎:li 賀:he 顧:gu 毛:mao 邵:shao 銭:qian 厳:yan 武:wu 戴:dai 孔:kong 湯:tang
欧陽:ouyang 司馬:sima 諸葛:zhuge 上官:shangguan
`);

export const CN_GIVEN_REAL_MALE = entries(`
偉:wei 強:qiang 磊:lei 軍:jun 洋:yang 勇:yong 傑:jie 涛:tao 明:ming 超:chao 剛:gang 平:ping 子涵:zihan 浩宇:haoyu
宇軒:yuxuan 俊傑:junjie 子軒:zixuan 思遠:siyuan 天佑:tianyou 志強:zhiqiang 建国:jianguo 国華:guohua 文博:wenbo
浩然:haoran 博文:bowen 明軒:mingxuan 子豪:zihao 嘉偉:jiawei 志明:zhiming 建華:jianhua
`);

export const CN_GIVEN_REAL_FEMALE = entries(`
芳:fang 秀英:xiuying 娜:na 敏:min 静:jing 麗:li 艶:yan 娟:juan 霞:xia 秀蘭:xiulan 桂英:guiying 梓萱:zixuan 欣怡:xinyi
一諾:yinuo 雨桐:yutong 詩涵:shihan 佳怡:jiayi 夢瑶:mengyao 婉清:wanqing 美玲:meiling 雅婷:yating 慧敏:huimin
曉燕:xiaoyan 麗華:lihua 思琪:siqi 雪梅:xuemei 若曦:ruoxi 紫涵:zihan 雨萱:yuxuan 心怡:xinyi
`);

export const CN_CHAR_MALE = entries(`
偉:wei 強:qiang 磊:lei 軍:jun 勇:yong 傑:jie 涛:tao 明:ming 超:chao 剛:gang 平:ping 輝:hui 鵬:peng 華:hua 飛:fei
鑫:xin 波:bo 斌:bin 宇:yu 浩:hao 凱:kai 健:jian 俊:jun 帆:fan 旭:xu 寧:ning 龍:long 東:dong 峰:feng 博:bo 文:wen
志:zhi 国:guo 建:jian 子:zi 軒:xuan 沢:ze 睿:rui 晨:chen 逸:yi 航:hang 天:tian 嘉:jia 豪:hao 宏:hong 毅:yi 威:wei
`);

export const CN_CHAR_FEMALE = entries(`
芳:fang 娜:na 敏:min 静:jing 麗:li 艶:yan 娟:juan 霞:xia 玲:ling 婷:ting 雪:xue 琳:lin 慧:hui 晶:jing 燕:yan 紅:hong
梅:mei 萍:ping 欣:xin 怡:yi 涵:han 萱:xuan 悦:yue 琪:qi 瑶:yao 雨:yu 佳:jia 夢:meng 婉:wan 蘭:lan 月:yue 詩:shi
彤:tong 妍:yan 菲:fei 璐:lu 薇:wei 清:qing 嵐:lan 心:xin 子:zi 思:si
`);
