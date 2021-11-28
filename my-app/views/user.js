/************************************************
 * Class : 
 * 
 * state :
 *  - 
 * 
 * function :
 *  -  
 *  
 ************************************************/


import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import PostItBlock from '../components/postItBlock';
import CouponBox from '../components/userCouponBox';
import UserInfoBox from '../components/userInfoBox';
import { AntDesign } from '@expo/vector-icons';
import SelectBtn from '../components/userSelectBtn'
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

const ICON_COLOR = '#40E0D0';


class User extends Component {
    constructor(props){
        super(props);
        this.state = {
            //DB 적용시 수정 필요 (아래는 사용자 정보)
            db_user: this.props.db_user, //DB 사용자
            db_user_orders: 8, //this.props.db_user_orders, //사용자 주문 횟수
            db_user_grade: "Sliver",//this.props.db_user_grade, //사용자 등급
            coupon : [ //보유 쿠폰 목록
                "배달비 무료 쿠폰",
                "분식 메뉴 주문 시 3,000원 할인 쿠폰",
                "같이 먹어요, 배달비 무료 쿠폰",
                "기간 한정 피자 할인 쿠폰",
            ],
            point: 2000,
        }
    }

    //쿠폰 리스트 구성
    couponList(){
        var list = [];
        for(let i=0; i<this.state.coupon.length; i++){
            list.push(<TouchableOpacity 
            key={i+"_coupon"}
            style={styles.coupon}>
                <PostItBlock color_type={i} text={this.state.coupon[i]}/>
            </TouchableOpacity>);
        }
        return list;
    }

    //버튼 리스트 구성
    btnList() {
        var btns = 
            <View>
                <SelectBtn text={"알림 ON/OFF"} iconName={"bells"}></SelectBtn>
                <SelectBtn text={"즐겨찾기 관리"} iconName={"star"}></SelectBtn>
                <SelectBtn text={"친구 관리"} iconName={"meh"}></SelectBtn>
            </View>
        ;

        return btns;
    }

    //유저 정보 내용
    userInfo() {
        var detail =
            <View>
                <View style={styles.circle}>
                
                <View style={styles.totalstyle}>
                    <View style={styles.textline}>
                        <Text style={styles.titleFont}>떡볶이 좋아 <Text style={styles.basicFont}> 님</Text></Text> 
                    </View>
                    <View style={styles.textline}>
                        <Text style={styles.basicFont}>{this.state.db_user_grade} 등급</Text> 
                    </View>
                    <View style={styles.textline}>
                        <Text style={styles.OrderFont}>이번달 주문 횟수 <Text style={styles.point_color}>{this.state.db_user_orders}  </Text>    
                        사용 가능한 쿠폰 <Text style={styles.point_color}> {this.state.coupon.length} </Text>
                        </Text>
                    </View>
                </View>
                    <Text>얍</Text>
                </View>
            </View>
        ;
        return detail;
    }

    render(){
        return(
            <View style={this.props.style}>
                {/*유저의 이름, 등급, 주문횟수 및 사용 가능 쿠폰 표시해주는 창*/}
                <UserInfoBox   
                    func = {this.userInfo()}
                    text = {"사용 가능한 쿠폰이 있어요. 주문할 때 이용해보세요!"}
                >
                </UserInfoBox>

                {/*쿠폰과 포인트 표시 창*/}
                <View style={styles.coupon_container}>
                    <CouponBox
                        title = "test"
                        func = {this.couponList()}
                        point = {this.state.point}
                    ></CouponBox>
                </View>

                <Text style = {styles.headline}>
                        <Ionicons
                            name="md-settings"
                            size={20}
                            color={ICON_COLOR}
                            style={styles.icon} />
                        <Text style={styles.titleFont}>  개인 설정</Text>
                </Text>

                <View style={styles.headline}>
                    {/*설정 버튼 목록*/}
                    {this.btnList()}
                </View>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    //info창 글자 정렬
    totalstyle: {
        marginTop: -8
    },
    //민트색 글씨
    point_color: {
        alignSelf: 'flex-end',
        marginTop: 12,
        marginRight: 15,
        marginBottom: 10,
        fontSize: wp('4%'),
        fontWeight: 'bold',
        color: "#40E0D0"
    },
    //이미지 들어갈 곳
    circle: {   
        width: wp('18%'),
        height: wp('18%'),
        borderColor: '#F2F2F2',
        backgroundColor: '#F2F2F2',
        borderRadius: 100,
        marginTop: 12,
        marginLeft: 5
    },
    headline: {
        width: wp('90%'),
        fontSize: hp('3%'),
        marginLeft: 20,
        marginBottom: -15,
        marginTop: 5
    },
    //전체 화면 style
    container: {
        alignContent: 'center',
    },

    //해당 화면의 상위 컨테이너 부분 style
    header_contanier: {
        width: wp('100%'),
        alignContent: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingTop: hp('2%'),
        paddingBottom: hp('2%'),
    },
    //전체 화면 스크롤 style
    main_scroll: {
        width: wp('100%'),
        borderColor: '#fff',
        borderTopWidth: hp('1.5%'),
    },
    //상위 text style
    header_text: {
        fontSize: hp('1.5%'),
    },
    //알림 컴포넌트가 위치할 컨테이너 style
    coupon_container: {
        width: wp('90%'),
        alignSelf: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    //알림 컴포넌트 테두리 style
    coupon: {
        marginBottom: 5,
    },
    //주문 횟수, 사용가능 쿠폰 표시 글씨
    OrderFont: {
        width: wp("50%"),
        marginLeft: 50,
        fontWeight: "bold",
        fontSize: 16,
        marginLeft: 10,
        marginTop: 12
    },
    titleFont: {
        width: wp("50%"),
        marginLeft: 50,
        fontWeight: "bold",
        fontSize: 17,
        marginLeft: 10,
        marginTop: 5
    },
    basicFont: {
        fontWeight: "normal",
        fontSize: 16,
        marginLeft: 10,
        marginTop: 5
    },
    //userInfo 탭에 글씨 정렬
    textline: {
        width: wp('100%'),
        fontSize: hp('3%'),
        marginLeft: 80,
        marginBottom: -15,
        marginTop: 10
    },
    icon : {
        alignContent: 'flex-end',
    }
  });

export default User;