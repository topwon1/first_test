/************************************************
 * Class : NOW 주문
 * 
 * state :
 *  - db_user: 유저 정보
 *  - db_order: 임시 데이터
 * 
 * const :
 *  - MAX_MENU_NUM: 각 주문 내 표시할 최대 자신이 주문한 메뉴 개수
 *                  해당 숫자 이상의 메뉴를 주문한 경우 이후부터는 '그외 #개의 메뉴'로 대체
 * function :
 *  - orderHistory_top: 주문 컴포넌트의 상단 부분에 추가할 컴포넌트 반환
 *  - orderHistory_bottom: 주문 컴포넌트의 하단 부분에 추가할 컴포넌트 반환
 *  - orderHistoryList: 주문 컴포넌트의 리스트를 반환
 *  - searchList : 설정한 조건에 맞도록 정렬을 하여 리스트를 보여주는 역할을 한다. 리스트 정보는 DB에서 불러와 처리한다.
 *  - selectSearch : 검색을 위해 조건을 체크할 경우 검색 조건을 저장하는 동작을 처리한다.
 ************************************************/

import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import TwoColorBlock from '../components/twoColorBlock';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MaterialCommunityIcons, AntDesign, Entypo } from '@expo/vector-icons';
import LocationBar from '../components/locationBar';

//import posed from 'react-native-pose';
import Page from "../views/page.js"
const SearchPage=Page

const databaseURL = "http://gcloud.parkmin-dev.kr:3000"; // firebase URL
const MAX_MENU_NUM = 2;
/*
const Page = posed.View({
    open: {
        y: 0,
        opacity: 1,
        transition: {
          y: { 
              type: 'spring', 
              stiffness: 500, 
              damping: 100
            },
        }
    },
    closed: {
        y: hp('5%'), 
        opacity: 0
    },
});
const SearchPage = posed.View({
    closed: {
        y: 0,
        opacity: 1,
        transition: {
            y: { 
                type: 'spring', 
                stiffness: 1000, 
                damping: 100
              },
          }
    },
    opened: {
        y: hp('18%'),
        opacity: 1,
        transition: {
            y: { 
                type: 'spring', 
                stiffness: 1000, 
                damping: 100
              },
          }
    },
});*/

class NowOrder extends Component {
    constructor(props){
        super(props);
        this.orderHistory_top = this.orderHistory_top.bind(this);
        this.IsSearchMode = this.IsSearchMode.bind(this);
        this.selectSearch = this.selectSearch.bind(this);
        this.state = {
            btn_flag: [false, false, false, false, false, false],
            event: 'closed',
            search: '',
            search_bar: 'closed',
            search_mode : 0,
            notice: 0,
            db_user: this.props.db_user,
            db_order: [],
            db_store: []
        }   
    }
    
    /**
     * @method "load data and then store to the state"
     */
    _get() {
        fetch(`${databaseURL}/db_store`).then(res => {
            if(res.status != 200) {
                throw new Error(res.statusText);
            }
            return res.json();
            }).then(db_store => this.setState({db_store: db_store}));
        fetch(`${databaseURL}/db_order`).then(res => {
            if(res.status != 200) {
                throw new Error(res.statusText);
            }
            return res.json();
            }).then(db_order => this.setState({db_order: db_order}));
    }

    /**
     * @method "IsChange?"
     */
    shouldComponentUpdate(nextProps, nextState) {
        return (nextState.db_order != this.state.db_order) || (nextState.db_store != this.state.db_store) || (nextState.search != this.state.search) || (nextState.search_mode != this.state.search_mode) || (nextState.btn_flag != this.state.btn_flag);
    }

    componentDidMount() {
        this.setState({event: 'open'});
        if(this.props.data !== ''){
            this.setState({
                search: this.props.data,
                search_mode: 1,
                search_bar: 'opened',
            });
        }
        this._get();
        
    }

    orderHistory_top(_num) {
        if(this.state.db_store.length == 0 || this.state.db_order.length == 0){
            return null;
        }
        var store_num = this.state.db_order[_num].store_num;
        const db_store_this = this.state.db_store[store_num];

        var order_detail = this.state.db_order[_num].order_detail;
        var store_image = this.state.db_order[_num].store_image;
        var user_menu = [];
        var user_menu_amount = 0;
        
        var store_category = db_store_this.category;
        var total_price = 0;    
        var user_price = 0;
        var current = this.state.db_order[_num].current_order;
        var limit = this.state.db_order[_num].limit_order;
        var location = this.state.db_order[_num].location.name;
        //해당 순서 데이터의 order_detail을 받아와 컴포넌트 생성
        Object.keys(order_detail).map(id => {
            user_price = user_price + order_detail[id].price*order_detail[id].amount;
            user_menu_amount = user_menu_amount + 1;
            if(user_menu.length<MAX_MENU_NUM){
                user_menu.push(
                    <View key={id+"_user_menu"} style={styles.row_container}>
                    <Text style={styles.user_menu_text}>
                        {order_detail[id].menu}
                        {' * '+order_detail[id].amount}
                    </Text>
                    <Text style={styles.user_menu_text}>{(order_detail[id].price*order_detail[id].amount).toLocaleString()}원</Text>
                </View>);
            }
            
            total_price = total_price + order_detail[id].price*order_detail[id].amount;
        });

        //실질적인 top 블록에 추가할 컴포넌트
        var alone_txt = ""
        let cond_alone = this.state.db_order[_num].alone;
        if(cond_alone == 0) {
            alone_txt = "같이 먹어요!";
        } else if(cond_alone == 1) {
            alone_txt = "혼자 먹어요";
        } else {
            alone_txt = "error";
        }

        var top = <View style={styles.top_order_history}>
            <Image
            style={styles.store_image}
            source={require('../images/test_image.jpg')}/>
            <View style={styles.top_text_container}>
                <View style={{flexDirection: 'row', marginTop: 6}}>
                    <Text style={{fontWeight: 'bold'}}>{store_category}</Text>
                    <Text style={{color : "#848484"}}> {alone_txt}</Text>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                    <Entypo name="location" size={hp('2%')} color="#40e0d0" /><Text style={{marginLeft : 5, marginTop : 1, color: "#848484"}}>{location}</Text>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                    <Text style={{color : "#848484"}}>모집인원</Text><Text style={{marginLeft:20, color:"#40e0d0", fontWeight: "bold"}}>{current}명</Text><Text style={{color: "#848484"}}> / {limit}명</Text>
                </View>
                
            </View>
        </View>;
        return [top, user_price, total_price];
    }

    orderHistory_bottom(_num, user_price, total_price){
        return<View style={styles.bottom_order_history}>
                <Text style={styles.store_name}>
                    {this.state.db_order[_num].store_name}
                </Text>
                <View style={styles.price_container}>
                    <View style={styles.row_container}>
                        <Text style={styles.total_price_text}>전체 결제 금액</Text>
                        <Text style={styles.total_price}>{total_price.toLocaleString()}</Text>
                    </View>
                    <View style={styles.row_container}>
                        <Text style={styles.user_price_text}>모인 결제 금액</Text>
                        <Text style={styles.user_price}>{user_price.toLocaleString()}</Text>
                    </View>
                </View>
            </View>;
    }

    /**
     * @method "order list loading"
     */
    orderHistoryList(){
        if(this.state.db_store.length == 0 || this.state.db_order.length == 0){
            return null;
        }
        var list = [];
        Object.keys(this.state.db_order).map(id => {
            var top_data = this.orderHistory_top(id);
            list.push(
                <View
                key={id + "_history"}>
                    <View
                    style={{position: 'absolute', height: hp('21%'), width: '100%', zIndex: -1}}>
                        <TwoColorBlock
                            topHeight={2}
                            bottomHeight={1}
                            type={0}
                            shadow={true}/>
                    </View>
                    <TouchableOpacity
                        style={styles.order_history_container}
                        >
                            <TwoColorBlock
                                topHeight={2}
                                bottomHeight={1}
                                type={0}
                                top={top_data[0]}
                                bottom={this.orderHistory_bottom(id, top_data[1], top_data[2])}
                                shadow={false}/>
                    </TouchableOpacity>
                </View>
            );
        });
        return list;
    }

    /**
     * @method "search-bar result loading"
     */   
    searchList() {
        /**
         * btn_flag
         * 0 가격 순 정렬
         * 1 별점 순 정렬
         * 2 최소 금액 없음
         * 3 너만 오면 주문
         * 4 혼자 먹어요
         * 5 같이 먹어요
         */
        if(this.state.db_store.length == 0 || this.state.db_order.length == 0){
            return null;
        }
        
        let nextState = this.state.db_order;

        [].slice.call(nextState).sort(function(a, b){
            var temp_a = a.current_order / a.limit_order;
            var temp_b = b.current_order / b.limit_order;
            return temp_a > temp_b ? -1 : temp_a < temp_b ? 1 : 0;
        });

        this.setState({db_order : nextState});
        var list = [];
        var search_condition = this.state.btn_flag;
        
        if(this.state.search === ''){
            Object.keys(this.state.db_order).map(id => {
                let cond_store_num = this.state.db_order[id].store_num;
                let cond_min_order = this.state.db_store[cond_store_num].min_order;
                let cond_alone = this.state.db_order[id].alone;
                let cond_current = this.state.db_order[id].current_order;
                let cond_limit = this.state.db_order[id].limit_order;
                let cond_finish_order = cond_limit - cond_current;

                /* 다중 선택 조건 처리 */
                if(search_condition[2] && cond_min_order != 0)  return; // 배달 팁 없음
                if(search_condition[3] && cond_finish_order != 1) return; // 너만 오면 주문~!
                if(search_condition[4] && cond_alone != 1)   return; // 혼자 먹어요
                if(search_condition[5] && cond_alone != 0)   return; //같이 먹어요

                var top_data = this.orderHistory_top(id);
                list.push(
                    <View
                key={id+"_history"}>
                    <View
                    style={{position: 'absolute', height: hp('21%'), width: '100%', zIndex: -1}}>
                        <TwoColorBlock
                            topHeight={2}
                            bottomHeight={1}
                            type={0}
                            shadow={true}/>
                    </View>
                    <TouchableOpacity
                        style={styles.order_history_container}
                        onPress={function(){
                            this.props.sendData(1+" "+id);
                            this.props.changeMode("detail-order");
                        }.bind(this)}
                        >
                            <TwoColorBlock
                                topHeight={2}
                                bottomHeight={1}
                                type={0}
                                top={top_data[0]}
                                bottom={this.orderHistory_bottom(id, top_data[1], top_data[2])}
                                shadow={false}/>
                    </TouchableOpacity>
                </View>
                );                   
            });
        } else {
            Object.keys(this.state.db_order).map(id => {
                if(this.state.db_order[id].store_name.indexOf(this.state.search) !== -1){
                    var top_data = this.orderHistory_top(id);
                    list.push(
                        <View
                key={id+"_history"}>
                    <View
                    style={{position: 'absolute', height: hp('21%'), width: '100%', zIndex: -1}}>
                        <TwoColorBlock
                            topHeight={2}
                            bottomHeight={1}
                            type={0}
                            shadow={true}/>
                    </View>
                    <TouchableOpacity
                        style={styles.order_history_container}
                        onPress={function(){
                            this.props.sendData(1+" "+id);
                            this.props.changeMode("detail-order");
                        }.bind(this)}
                        >
                            <TwoColorBlock
                                topHeight={2}
                                bottomHeight={1}
                                type={0}
                                top={top_data[0]}
                                bottom={this.orderHistory_bottom(id, top_data[1], top_data[2])}
                                shadow={false}/>
                    </TouchableOpacity>
                </View>
                    );
                }
            });
        }
        return list;
    }

    /**
     * @method "when sort btn pressed"
     * @param "state btn_flag id"
     */
    selectSearch(id) {
        var btn_on_off = this.state.btn_flag;
        if(id == 3 && btn_on_off[id] == false && this.state.notice == 0) {
            Alert.alert(
                '"#너만 오면 주문" 이란?',
                '모집이 임박한 주문들만 보여줘요! 어서 빨리 주변 친구들과 맛있는 식사를 하러 가봅시다!',
                [{
                    text: "알겠습니다",
                }]);
                this.setState({notice : 1}); // 알림은 한번만!
        }
        if(btn_on_off[id] == false) {
            btn_on_off[id] = true;
            // 별점순 정렬과 가격 순 정렬 동시 x
            if(id == 0 && (btn_on_off[1] == true)) {
                btn_on_off[1] = false;
            } else if(id == 1 && (btn_on_off[0] == true)) {
                btn_on_off[0] = false;
            }

            // 혼자 먹어요랑 같이 먹어요는 동시 x
            if(id == 4 && (btn_on_off[5] == true)) {
                btn_on_off[5] = false;
            } else if(id == 5 && (btn_on_off[4] == true)) {
                btn_on_off[4] = false;
            }
            
            this.setState({btn_flag : btn_on_off});
        } else if(btn_on_off[id] == true) {
            btn_on_off[id] = false;
            this.setState({btn_flag : btn_on_off});
        } else {
            alert('sort btn state error! call your admin');
        }
        this.forceUpdate();
    }

    /**
     * @method "search mode on/off"
     */
    IsSearchMode() {
        var unpressed = {color: "#FFF", fontWeight: "bold"};
        var pressed = {color: "#585858", fontWeight: "bold"};
        /**
         * @condition "is search mode off?"
         */
        if(this.state.search_mode == 0) {
            return(
            <TouchableOpacity
                style={styles.search_bar}
                onPress={function() {
                    if(this.state.search_mode == 1) {
                        this.setState({search_mode: 0, search_bar: 'closed'});
                    } else {
                        this.setState({search_mode: 1, search_bar: 'opened'});
                    }
                }.bind(this)}>
                    <Text style={{color:'#fff', fontSize:hp('1.9%')}}> Search </Text>
                    <AntDesign name="downcircleo" size={hp('2%')} color="#fff" />
            </TouchableOpacity>
            );

        /**
         * @condition "is search mode on?"
         */
        } else if(this.state.search_mode == 1) {
            var btn_txt = ["#가격 순 정렬", "#별점 순 정렬", "#최소 금액 없음", "#너만 오면 주문", "#혼자먹어요", "#같이먹어요"];
            
            var btn_list_1 = []; // 1열 : 가격, 별점, 배달팁
            var btn_list_2 = []; // 2열 : 가까운, 혼자, 같이

            for(let i = 0; i < 3; i++) {
                if(this.state.btn_flag[i] == false) { // 안눌림
                    btn_list_1.push(
                        <TouchableOpacity key={i + "_sort_btn"} style={styles.sort_btn_unpressed} 
                            onPress={function() { this.selectSearch(i) }.bind(this)}>
                            <Text style={unpressed}>{btn_txt[i]}</Text>
                        </TouchableOpacity>
                        );
                } else if(this.state.btn_flag[i] == true) { // 눌림
                    btn_list_1.push(
                        <TouchableOpacity key={i + "_sort_btn"} style={styles.sort_btn_pressed} onPress={function() { this.selectSearch(i) }.bind(this)}>
                            <Text style={pressed}>{btn_txt[i]}</Text>
                        </TouchableOpacity>
                        );
                }

            }

            for(let i = 3; i < 6; i++) {
                if(this.state.btn_flag[i] == false) { // 안눌림
                    btn_list_2.push(
                        <TouchableOpacity key={i + "_sort_btn"} style={styles.sort_btn_unpressed} onPress={function() { this.selectSearch(i) }.bind(this)}>
                            <Text style={unpressed}>{btn_txt[i]}</Text>
                        </TouchableOpacity>
                        );
                } else if(this.state.btn_flag[i] == true) { // 눌림
                    btn_list_2.push(
                        <TouchableOpacity key={i + "_sort_btn"} style={styles.sort_btn_pressed} onPress={function() { this.selectSearch(i) }.bind(this)}>
                            <Text style={pressed}>{btn_txt[i]}</Text>
                        </TouchableOpacity>
                        );
                }
            }

            return(
            <TouchableOpacity
                style={styles.search_bar_open}
                onPress={function() {
                    if(this.state.search_mode == 1) {
                        this.setState({search_mode: 0, search_bar: 'closed'});
                    } else {
                        this.setState({search_mode: 1, search_bar: 'opened'});
                    }
                }.bind(this)}>
                <View style={{flex:2}}>
                    <View style={{flex:1}}>
                        <Text style={{color: "#FFF", fontWeight: "bold", fontSize: 18}}># 골라먹기</Text>
                        <View style={{flexDirection: 'row'}}>
                            {btn_list_1}
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            {btn_list_2}
                        </View>
                    </View>
                    <View style={{flex:1, marginTop: 30}}>
                        <Text style={{color: "#FFF", fontWeight: "bold", fontSize: 18}}># 먹고싶은음식</Text>
                        <TextInput
                        style={styles.search}
                        placeholder="원하시는 음식을 검색해보세요"
                        onChangeText={(text)=>this.setState({search: text})}
                        value={this.state.search}/>
                    </View>

                </View>

            </TouchableOpacity>
            );
        } else {
            alert('state error!');
        }
    }
    render(){
        return(
             <Page style={[this.props.style, styles.container]} pose={this.state.event}>
                <SearchPage style={styles.main_container} pose={this.state.search_bar}>
                    <View style={{ marginTop:'22%', marginBottom: '2%',
                     flexDirection: 'row', width: '90%', alignSelf: 'center'}}>
                        <AntDesign
                            name="checksquare"
                            size={20}
                            color="#40e0d0" />
                        <Text style={{fontSize:hp('2%'), fontWeight: 'bold', marginLeft: '2%'}}>NOW 주문</Text>
                    </View>
                    <ScrollView style={styles.main_scroll}>

                        {this.searchList()}

                    </ScrollView>

                </SearchPage>

                {this.IsSearchMode()}

                <TouchableOpacity
                    style={styles.makeOrder}
                    onPress={function(){this.props.changeMode("make-room")}.bind(this)}>
                        <MaterialCommunityIcons name="silverware-fork-knife" size={hp('2%')} color="#fff" />
                        <Text style={{color:'#fff', fontSize:hp('1.9%'), fontWeight: 'bold'}}> 방 만들기</Text>
                    </TouchableOpacity>
                <LocationBar db_user={this.state.db_user}/>
            </Page>
        );
    }
}

const styles = StyleSheet.create({
    //최상위 컨테이너 style
    container: {
        alignItems: 'center',
    },
    //내용물 중 목록이 들어갈 컨테이너 style
    main_container: {
        width: wp('100%'),
        height: '100%',
    },

    //메인 스크롤 style
    main_scroll: {
        width: '90%',
        alignSelf: 'center',
        alignContent: 'center',
    },

    //주문 컴포넌트 style
    order_history_container: {
        height: hp('21%'),
        marginBottom: hp('1.5%'),
    },

    //주문 컴포넌트 상위 블록 style
    top_order_history: {
        margin: hp('2%'),
        flexDirection: 'row',
    },

    //주문 컴포넌트 상단 블록의 우측 text 블록 style
    top_text_container: {
        width: wp('50%'),
    },
    
    //주문일시 text style
    date_text: {
        fontSize: hp('1.5%'),
        marginBottom: hp('1%'),
    },

    //메뉴 text style
    user_menu_text: {
        fontSize: hp('1.8%'),
    },

    //주문 컴포넌트 하위 블록 style
    bottom_order_history: {
        margin: hp('2%'),
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'space-between'
    },

    //주문별 가게 image style
    store_image: {
        width: wp('20%'),
        height: hp('10%'),
        borderRadius: 10,
        marginRight: wp('3%'),
    },

    //가로 나열 배치 및 각 content 간격 최대 style
    row_container: {
        flexDirection: 'row', 
        justifyContent: 'space-between',
    },

    

    //가게명 text style
    store_name: {
        width: '65%',
        fontSize: hp('2%'),
        fontWeight: 'bold',
        alignSelf: 'center',
    },

    //결제 금액 블록 style
    price_container:{
        width: '35%',
        justifyContent: 'space-between',
    },

    //전체 결제 금액 text style
    total_price_text: {
        fontSize: hp('1.5%'),
        color: '#555',
    },

    //전체 결제 금액 style
    total_price: {
        fontSize: hp('1.5%'),
        fontWeight: 'bold',
        color: '#555',
    },

    //개인 결제 금액 text style
    user_price_text: {
        fontSize: hp('1.5%'),
        fontWeight: 'bold',
        color: '#555',
    },

    //개인 결제 금액 style
    user_price: {
        fontSize: hp('1.5%'),
        fontWeight: 'bold',
        color: '#40E0D0',
    },
    // 방만들기
    makeOrder: {
        position: 'absolute',
        marginTop: hp('75%'),
        width: wp('90%'),
        alignSelf: 'center',
        backgroundColor: '#40e0d0',
        borderRadius: 10,
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('1%'),
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center',
    },

    // 닫힌 검색바
    search_bar: {
        position: 'absolute',
        width: wp('90%'),
        height: hp('5%'),
        marginTop: '9%',
        alignSelf: 'center',
        backgroundColor: '#40e0d0',
        borderRadius: 10,
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('1%'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: 0.9
    },

    // 열린 검색바
    search_bar_open: {
        position: 'absolute',
        width: wp('90%'),
        height: hp('23%'),
        marginTop: '9%',
        alignSelf: 'center',
        backgroundColor: '#40e0d0',
        borderRadius: 10,
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('1%'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    // 정렬 버튼
    sort_btn_unpressed: {
        backgroundColor:'#999',
        borderRadius: 10,
        alignItems: 'center',
        paddingHorizontal: 17,
        paddingVertical: 5,
        marginRight: 7,
        marginBottom: 6,
        marginTop: 6
    },

    sort_btn_pressed: {
        backgroundColor:'#FFF',
        borderRadius: 10,
        alignItems: 'center',
        paddingHorizontal: 17,
        paddingVertical: 5,
        marginRight: 7,
        marginBottom: 6,
        marginTop: 6
    },

    //검색창 style
    search: {
        width: wp('80%'),
        height: 35,
        backgroundColor: "#FFF",
        alignSelf: 'center',
        borderRadius: 10,
        borderColor: '#ccc',
        borderWidth: 2,
        paddingHorizontal: 10,
        marginTop: 5
    },

  });

export default NowOrder;