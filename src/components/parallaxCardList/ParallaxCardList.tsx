import React, { useRef, useCallback, useEffect } from "react";
import { StyleSheet, View, ViewStyle, StyleProp, Dimensions } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    withSpring,
    runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector, ScrollView } from "react-native-gesture-handler";
import rpx from "@/utils/rpx";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ParallaxCardProps {
  index: number;
  totalCount: number;
  scrollY: Animated.SharedValue<number>;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function ParallaxCard({ index, totalCount, scrollY, children, style }: ParallaxCardProps) {
    const cardHeight = rpx(360);
    const cardSpacing = rpx(20);
    const startY = index * (cardHeight + cardSpacing);
    const endY = startY + cardHeight;

    const animatedStyle = useAnimatedStyle(() => {
        const inputRange = [startY - cardHeight, startY, endY, endY + cardHeight];
    
        // 缩放动画 - 当前卡片放大，上下卡片缩小
        const scale = interpolate(
            scrollY.value,
            inputRange,
            [0.85, 1, 0.95, 0.85],
            Extrapolate.CLAMP
        );
    
        // 透明度动画 - 当前卡片不透明，上下卡片透明
        const opacity = interpolate(
            scrollY.value,
            inputRange,
            [0.6, 1, 0.7, 0.5],
            Extrapolate.CLAMP
        );
    
        // Y轴偏移 - 视差效果
        const translateY = interpolate(
            scrollY.value,
            inputRange,
            [rpx(-40), 0, rpx(20), rpx(60)],
            Extrapolate.CLAMP
        );
    
        // X轴偏移 - 轻微左右摇摆
        const translateX = interpolate(
            scrollY.value,
            inputRange,
            [rpx(-10), 0, rpx(5), rpx(15)],
            Extrapolate.CLAMP
        );
    
        // 旋转效果
        const rotateZ = interpolate(
            scrollY.value,
            inputRange,
            [-3, 0, 1, 2],
            Extrapolate.CLAMP
        );
    
        // 阴影深度
        const shadowOpacity = interpolate(
            scrollY.value,
            inputRange,
            [0.1, 0.25, 0.15, 0.1],
            Extrapolate.CLAMP
        );
    
        const shadowRadius = interpolate(
            scrollY.value,
            inputRange,
            [8, 16, 12, 8],
            Extrapolate.CLAMP
        );

        return {
            transform: [
                { scale },
                { translateY },
                { translateX },
                { rotateZ: `${rotateZ}deg` },
            ],
            opacity,
            shadowColor: "#000",
            shadowOpacity,
            shadowRadius,
            shadowOffset: { width: 0, height: scale.value * 8 },
            zIndex: Math.round(scale.value * 100) + (totalCount - index),
        };
    });

    return (
        <Animated.View
            style={[
                styles.cardContainer,
                { height: cardHeight },
                animatedStyle,
                style,
            ]}
        >
            <View style={styles.cardInner}>{children}</View>
        </Animated.View>
    );
}

interface ParallaxBackgroundProps {
  scrollY: Animated.SharedValue<number>;
  children: React.ReactNode;
}

function ParallaxBackground({ scrollY, children }: ParallaxBackgroundProps) {
    const animatedStyle = useAnimatedStyle(() => {
    // 背景移动速度比前景慢，营造视差效果
        const translateY = interpolate(
            scrollY.value,
            [0, SCREEN_HEIGHT],
            [0, SCREEN_HEIGHT * 0.3],
            Extrapolate.CLAMP
        );
    
        const scale = interpolate(
            scrollY.value,
            [0, SCREEN_HEIGHT],
            [1, 1.1],
            Extrapolate.CLAMP
        );

        return {
            transform: [{ translateY }, { scale }],
        };
    });

    return (
        <Animated.View style={[styles.parallaxBackground, animatedStyle]}>
            {children}
        </Animated.View>
    );
}

interface ParallaxCardListProps {
  data: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  backgroundColor?: string;
  backgroundChildren?: React.ReactNode;
}

export default function ParallaxCardList({
    data,
    renderItem,
    backgroundColor,
    backgroundChildren,
}: ParallaxCardListProps) {
    const scrollY = useSharedValue(0);
    const scrollRef = useRef<ScrollView>(null);
    const lastVelocity = useRef(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
            lastVelocity.current = event.velocity.y;
        },
        onEndDrag: () => {
            // 惯性滚动结束后的弹性回弹效果
            if (Math.abs(lastVelocity.current) > 0.5) {
                const momentum = lastVelocity.current * 30;
                scrollY.value = withSpring(
                    scrollY.value + momentum,
                    {
                        damping: 20,
                        stiffness: 150,
                        mass: 0.8,
                    },
                    (finished) => {
                        if (finished) {
                            runOnJS(() => {
                                // 滚动结束后的吸附效果
                                if (scrollRef.current) {
                                    const cardHeight = rpx(360) + rpx(20);
                                    const currentPos = scrollY.value;
                                    const targetIndex = Math.round(currentPos / cardHeight);
                                    const targetY = targetIndex * cardHeight;
                  
                                    scrollRef.current?.scrollTo({
                                        y: targetY,
                                        animated: true,
                                    });
                                }
                            })();
                        }
                    }
                );
            }
        },
    });

    const flingGesture = Gesture.Fling()
        .onStart((event) => {
            const velocity = event.velocityY;
            const momentum = velocity * 50;
      
            if (scrollRef.current) {
                const currentScrollY = scrollY.value;
                const targetY = Math.max(0, currentScrollY + momentum);
        
                scrollRef.current.scrollTo({
                    y: targetY,
                    animated: true,
                });
            }
        });

    const snapToCard = useCallback((index: number) => {
        const cardHeight = rpx(360) + rpx(20);
        const targetY = index * cardHeight;
    
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                y: targetY,
                animated: true,
            });
        }
    }, []);

    useEffect(() => {
    // 初始定位到第一张卡片居中
        snapToCard(0);
    }, [snapToCard]);

    return (
        <GestureDetector gesture={flingGesture}>
            <View style={[styles.container, { backgroundColor }]}>
                {/* 视差背景层 */}
                {backgroundChildren && (
                    <ParallaxBackground scrollY={scrollY}>
                        {backgroundChildren}
                    </ParallaxBackground>
                )}
        
                {/* 卡片列表层 */}
                <ScrollView
                    ref={scrollRef}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    bounces={true}
                    decelerationRate="fast"
                >
                    {data.map((item, index) => (
                        <ParallaxCard
                            key={item.id || index}
                            index={index}
                            totalCount={data.length}
                            scrollY={scrollY}
                        >
                            {renderItem(item, index)}
                        </ParallaxCard>
                    ))}
          
                    {/* 底部额外空间 */}
                    <View style={{ height: SCREEN_HEIGHT * 0.5 }} />
                </ScrollView>
        
                {/* 拖拽指示 */}
                <View style={styles.dragIndicator}>
                    <View style={styles.dragBar} />
                </View>
            </View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: "hidden",
        backgroundColor: "#1a1a1a",
    },
    parallaxBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
    scrollContent: {
        paddingTop: SCREEN_HEIGHT * 0.35,
        paddingBottom: SCREEN_HEIGHT * 0.1,
        paddingHorizontal: rpx(24),
    },
    cardContainer: {
        marginBottom: rpx(20),
        borderRadius: rpx(24),
        overflow: "hidden",
    },
    cardInner: {
        flex: 1,
        borderRadius: rpx(24),
        overflow: "hidden",
    },
    dragIndicator: {
        position: "absolute",
        top: rpx(40),
        left: "50%",
        transform: [{ translateX: rpx(-30) }],
        zIndex: 100,
    },
    dragBar: {
        width: rpx(60),
        height: rpx(6),
        borderRadius: rpx(3),
        backgroundColor: "rgba(255, 255, 255, 0.5)",
    },
});