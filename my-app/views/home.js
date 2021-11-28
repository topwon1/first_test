/************************************************
 * Class : 홈 화면 
 * 
 * props :
 *  - db_user: 사용자의 id
 * 
 * const :
 *  - ICON_COLOR : 위치설정 칸 내 아이콘 색상
 *  - COLOR_SET : HOT 주문 색상 설정용.
 *                저장된 색상들이 순서대로 반복적으로 적용됨.
 *                (hotOrderList 참고)
 * state :
 *  - db_user: 사용자 정보
 *  - hot_menu: 현재 인기 메뉴 리스트
 *  - hot_store: 현재 인기 가게
 *  - db_order: 현재 주문 리스트
 *  - db_store: 가게 리스트
 * 
 * function :
 *  - (static) getDerivedStateFromProps : db를 통해 hot_menu와 hot_store 연산
 *  - hotMenuList : hot_menu를 통해 해당 목록의 버튼들을 리스트로 출력
 *  - hotOrderList : db_order와 db_store를 통해 해당 목록의 버튼들을 리스트로 출력
 *                   또한 주문 목록 정리
 *  - searchMenu(): 선택한 버튼에 대한 메뉴를 검색 기능을 통해 검색하고 해당 페이지로 이동
 *  - selectOrder(): 선택한 주문의 상세 페이지로 이동
 *  
 ************************************************/

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TouchableText from '../components/TouchableText';
import TouchableOrder from '../components/TouchableOrder';
import TouchableList from '../components/touchableList';
import LocationBar from '../components/locationBar';
import posed from 'react-native-pose';

const COLOR_SET = ['#00CED1','#8BAAF0', '#7AD3FA', '#40e0d0'];
const databaseURL = "http://gcloud.parkmin-dev.kr:3000";
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

class Home extends Component {
    constructor(props){
        super(props);
        this.state = {
            db_user: this.props.db_user,
            search: '',
            hot_menu: [],
            hot_store:[],
            db_order: [],
            db_store: [],
            event: 'closed',
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
        return (nextState.db_store != this.state.db_store) || (nextState.db_order != this.state.db_order) || (nextState.search != this.state.search);
    }

    componentDidMount() {
        this.setState({event: 'open'});
        this._get();
    }
    
    static getDerivedStateFromProps(nextProps, nextState) {
        if(nextState.db_store.length == 0 || nextState.db_order.length == 0){
            return null;
        }
        //인기 메뉴, 인기 가게 목록 정리
        var hot_menu=[];
        var hot_store=[];

        Object.keys(nextState.db_order).map(id => {
            var found_menu = hot_menu.find(element => 
                element.category===nextState.db_store[nextState.db_order[id].store_num].category);
            var found_store = hot_store.find(element =>
                element.store_num==nextState.db_order[id].store_num);
            if(found_menu==undefined){
                hot_menu.push({category: nextState.db_store[nextState.db_order[id].store_num].category, amount: 1});
            }else {
                found_menu.amount = found_menu.amount + 1;
            }
            if(found_store==undefined){
                hot_store.push({store_num: nextState.db_order[id].store_num, amount: 1});
            }else{
                found_store.amount = found_store.amount + 1;
            }
        });

        hot_menu.sort(function (a, b){
            return a.amount > b.amount ? -1 : a.amount < b.amount ? 1 : 0;
        });
        hot_store.sort(function (a, b){
            return a.amount > b.amount ? -1 : a.amount < b.amount ? 1 : 0;
        });

        var result_menu = [];

        for(let j = 0; j < hot_menu.length; j++){
            result_menu.push(hot_menu[j].category);
        }

        //전체 주문 목록 정리(에러때메 빼놓음)
        // nextState.db_order.sort(function(a, b){
        //     var temp_a = a.current_order/a.limit_order;
        //     var temp_b = b.current_order/b.limit_order;
        //     return temp_a > temp_b ? -1 : temp_a < temp_b ? 1 : 0;
        // });
        return {
            hot_menu: result_menu,
            hot_store: hot_store,
            db_order: nextState.db_order,
        };
    }
    hotMemuList(){
        var list = [];
        var i = 0;
        while(i<this.state.hot_menu.length){
            list.push(<TouchableText
                        text={this.state.hot_menu[i]}
                        event={function(_text){
                            this.props.sendData(_text);
                            this.props.changeMode('now-order');
                        }.bind(this)}
                        sendData={this.props.sendData.bind(this)}
                        changeMode={this.props.changeMode}
                        key={i+"_hot_menu"}/>);
            i = i + 1;
        }
        if(list.length==0){
            list.push(<Text key={"empty_hot_menu"}>주문이 없어요!</Text>);
        }
        return list;
    }
    hotStoreList(){
        if(this.state.db_store.length == 0 || this.state.db_order.length == 0){
            return null;
        }
        var list = [];
        var i = 0;
        var store_num, store_name;
        //db에서 받은 정보를 가공, 혹은 가공된 정보를 state에 저장 후 아래 수행
        while(i<this.state.hot_store.length){
            store_num = this.state.hot_store[i].store_num;
            list.push(<TouchableOrder
                store={this.state.db_store[store_num]}
                amount={this.state.hot_store[i].amount}
                key={i+"_hot_store"}
                color={COLOR_SET[i%COLOR_SET.length]}
                event={function(){
                    this.props.changeMode("now-order");
                }.bind(this)}
                sendData={this.props.sendData.bind(this)}
                />);
            i = i + 1;
        }
        return list;
    }

    //searchMenu(): 선택한 버튼에 대한 메뉴를 검색 기능을 통해 검색한다.
    searchMenu(list){
        Object.keys(this.state.db_order).map(id => {
            if(this.state.db_store[this.state.db_order[id].store_num].name.indexOf(this.state.search)!== -1){
                let per = this.state.db_order[id].current_order/this.state.db_order[id].limit_order;
                if(per > (2/5)){
                    list.push(
                        <TouchableList
                        key={id+"_order"}
                        order={this.state.db_order[id]}
                        store={this.state.db_store[this.state.db_order[id].store_num]}/>
                    );
                }
            }else if(this.state.db_store[this.state.db_order[id].store_num].category.indexOf(this.state.search)!== -1){
                let per = this.state.db_order[id].current_order/this.state.db_order[id].limit_order;
                if(per > (2/5)){
                    list.push(
                        <TouchableList
                        key={id+"_order"}
                        order={this.state.db_order[id]}
                        store={this.state.db_store[this.state.db_order[id].store_num]}/>
                    );
                }
            }
        });
        list.sort(function(a, b){
            return (b.props.order.current_order/b.props.order.limit_order) - (a.props.order.current_order/a.props.order.limit_order);
        });
        return list;
    }

    //selectOrder(): 선택한 주문의 상세 페이지로 이동
    selectOrder() {
        this.props.changeMode("detail-order");
    }

    //searchList(String): String 인자가 있는 경우 해당 String을 토대로 필터링된 주문에 대해 
    //모집 마감을 위해 더 적은 인원이 필요한 주문 목록을 순서대로 버튼으로 만들어 화면에 출력
    searchList(){
        if(this.state.db_store.length == 0 || this.state.db_order.length == 0){
            return null;
        }
        var list = [];
        if(this.state.search===''){
            Object.keys(this.state.db_order).map(id => {
                let per = this.state.db_order[id].current_order/this.state.db_order[id].limit_order;
                if(per > (2/5)){
                    list.push(
                        <TouchableList
                        key={id+"_order"}
                        order={this.state.db_order[id]}
                        store={this.state.db_store[this.state.db_order[id].store_num]}
                        event={function(){
                            this.props.sendData(1+" "+id);
                            {this.selectOrder()}; 
                        }.bind(this)}
                        sendData={this.props.sendData.bind(this)}
                        changeMode={this.props.changeMode}/>
                    );
                }
            });

        }else{
            //선택한 버튼에 대한 메뉴를 검생한 기능을 통해 검색
            {this.searchMenu(list)}
        }
        list.sort(function(a, b){
            return (b.props.order.current_order/b.props.order.limit_order) - (a.props.order.current_order/a.props.order.limit_order);
        });
        return list;
    }

    render(){
        return(
            
            <Page style={[this.props.style, styles.container]} pose={this.state.event}>
                
                <ScrollView style={styles.main_scroll}>
                    {/* 지금 HOT한 주문 부분 */}
                    <Text style={styles.headline}>
                        <Text>지금</Text>
                        <Text style={{fontWeight: "bold"}}> HOT한 </Text>
                        <Text>가게</Text>
                    </Text>

                    <ScrollView 
                    style={styles.horizontal_scroll}
                    horizontal={true} 
                    showsHorizontalScrollIndicator={false}>
                        {this.hotMemuList()}
                    </ScrollView>
                    <ScrollView 
                    style={styles.horizontal_scroll}
                    horizontal={true} 
                    showsHorizontalScrollIndicator={false}>
                        {this.hotStoreList()}
                    </ScrollView>

                    {/* 곧 FINISH 주문 부분 */}
                    <Text style={styles.headline}>
                        <Text>곧</Text>
                        <Text style={{fontWeight: "bold"}}> FINISH </Text>
                        <Text>주문</Text>
                    </Text>

                    <TouchableOpacity
                    style={styles.makeOrder}
                    onPress={function(){this.props.changeMode("make-room")}.bind(this)}>
                        <MaterialCommunityIcons name="silverware-fork-knife" size={hp('2%')} color="#fff" />
                        <Text style={{color:'#fff', fontSize:hp('1.9%')}}> 방 만들기</Text>
                    </TouchableOpacity>

                    {/*검색 바*/}
                    <TextInput
                    style={styles.search}
                    placeholder="원하시는 음식을 검색해보세요"
                    onChangeText={(text)=>this.setState({search: text})}
                    value={this.state.search}/>
                    {this.searchList()}
                </ScrollView>
                <LocationBar db_user={this.state.db_user}/>
            </Page>
        );
    }
}

const styles = StyleSheet.create({
    //전체 화면 style
    container:{
        alignItems: 'center',
    },

    //전체 화면 스크롤 style
    main_scroll: {
        width: wp('100%'),
        borderColor: '#fff',
        borderTopWidth: hp('1.5%'),
    },

    //headline style
    headline: {
        width: wp('90%'),
        fontSize: hp('3%'),
        marginTop: 25,
        marginLeft: 20,
        //marginBottom: 10,
    },

    //가로 스크롤 style
    horizontal_scroll: {
        marginTop: 10,
        paddingHorizontal: wp('5%'),
    },

    //방 만들기 버튼 style
    makeOrder: {
        marginTop: hp('-4%'),
        marginRight: wp('5%'),
        alignSelf: 'flex-end',
        backgroundColor: '#40e0d0',
        borderRadius: 10,
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('1%'),
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'space-between',
    },

    //검색창 style
    search: {
        width: wp('90%'),
        height: 40,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 10,
        borderColor: '#ccc',
        borderWidth: 2,
        paddingHorizontal: 10,
    },
  });

export default Home;