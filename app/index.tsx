import React, { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function Camera() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [scannedData, setScannedData] = useState<{ type: string; content: string } | null>(null);

    // Valores compartilhados para animação
    const x = useSharedValue(0);
    const y = useSharedValue(0);
    const width = useSharedValue(0);
    const height = useSharedValue(0);
    const scale = useSharedValue(1);

    // Estilo animado para o cubo
    const animatedStyle = useAnimatedStyle(() => ({
        left: x.value,
        top: y.value,
        width: width.value,
        height: height.value,
        transform: [{ scale: scale.value }],
    }));

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    function onBarcodeScanned(data: any) {
        console.log('Barcode Data:', data);

        if (data?.bounds) {
            // Atualiza os valores compartilhados
            x.value = withTiming(data.bounds.origin.x, { duration: 300, easing: Easing.inOut(Easing.ease) });
            y.value = withTiming(data.bounds.origin.y, { duration: 300, easing: Easing.inOut(Easing.ease) });
            width.value = withTiming(data.bounds.size.width, { duration: 300, easing: Easing.inOut(Easing.ease) });
            height.value = withTiming(data.bounds.size.height, { duration: 300, easing: Easing.inOut(Easing.ease) });
            scale.value = withTiming(1.2, { duration: 300, easing: Easing.inOut(Easing.ease) });

            // Retorna ao tamanho normal após o destaque
            setTimeout(() => {
                scale.value = withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) });
            }, 300);
        }

        // Atualiza o estado com os dados do código escaneado
        setScannedData({ type: data.type, content: data.data });
    }

    // Verifica permissões da câmera
    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} onBarcodeScanned={onBarcodeScanned}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                        <Text style={styles.text}>Flip Camera</Text>
                    </TouchableOpacity>
                </View>
                {/* Cubo animado */}
                <Animated.View style={[styles.cube, animatedStyle]} />
            </CameraView>
            {/* Exibição dos dados do código escaneado */}
            {scannedData && (
                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>Type: {scannedData.type}</Text>
                    <Text style={styles.infoText}>Content: {scannedData.content}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    button: {
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 5,
    },
    text: {
        color: 'white',
    },
    cube: {
        position: 'absolute',
        borderWidth: 3,
        borderColor: 'white',
        borderRadius: 10,
    },
    infoContainer: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 5,
    },
    infoText: {
        color: 'white',
        fontSize: 16,
    },
});
