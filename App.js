import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  Button,
  Image,
  View,
  NavigatorIOS,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import './shim.js'
import crypto from 'crypto'
import StellarSdk from 'stellar-sdk'
import { createStackNavigator } from 'react-navigation';
import QRCode from 'react-native-qrcode'
import QRCodeScanner from 'react-native-qrcode-scanner';
import * as Keychain from 'react-native-keychain';
var activo = false;

//Pene

var publicKeyDestination = "GB6PACXR564X4PHW6B36SNW7OYXHPJJGPNPVBI5FJUOS227YOXB3NION";
var privateKeyDestination = "SALWDYX53AQ7GEBLVY5554XOBR4DHABCJXU5XVXPE4QCGPK6L3E2PKER";

var publicKeyDestination2 = "GDMZXWG46ZYPM7ROEFQPYOFTR253RPCHSB2KWXCV2YBYZ6I2KZ7GB6JX";
var privateKeyDestination2 = "SAKSWMEWOIKMLJJ5AQKAPVP2GLM6RIN7YBB26M2HKH3JHX65FAL5DZ7T";

var publicKeyIssuer = "GALXLNLEFKRCE7HTBAJM4IZB6D3YV5MVJDRDN3W2PFQNUUFNRYJCBY6I";
var mxnAsset = new StellarSdk.Asset("MXN", publicKeyIssuer);
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
StellarSdk.Network.useTestNetwork();

 

class HomeScreen extends Component<Props> {
  static navigationOptions={
    title:'Menú',
    }

constructor(props){
  super(props)
  this.state ={
    Cantidad:'',
    Direccion:'',
    isLoading:false,
    didLoad:false
  }
}

componentDidMount() {
   this.getBalance()
   this._interval = setInterval(() => {
    this.getBalance();}, 3000);
  }

  getBalance(){
    fetch('https://horizon-testnet.stellar.org/accounts/'+publicKeyDestination2)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          data:responseJson.balances,
          didLoad: true
        })
      })
      .catch((error) => {
        console.error(error);
      });
  }


  //manejar cambios en el input de cantidad
  cantidadChangeHandler= val => {
    this.setState({
      Cantidad:val
    });
  
  }

  //manejar cambios en el input de dirección
   direccionChangeHandler= val => {
    this.setState({
      Direccion:val
    });
  
  }

  // establecerContraseña=()=>{
  //   async () => {
  //     const username = 'zuck';
  //     const password = 'poniesRgr8';

  //     // Store the credentials
  //     var x = await Keychain.setGenericPassword(username, password); 
  //     return x;
  //   }
  // }

  // conseguirContraseña=()=>{
  //   var password2 = "WTF";
  //   async () => {
  //     try {
  //       // Retreive the credentials
  //       const credentials = await Keychain.getGenericPassword();
  //       if (credentials) {
  //         console.log('Credentials successfully loaded for user ' + credentials.username);
  //         password2 = credentials.password;
  //       } else {
  //         console.log('No credentials stored');
  //         password2 = "no credentials stored";
  //       }
  //     } catch (error) {
  //       console.log('Keychain couldn\'t be accessed!', error);
  //       password2 = "no access to keychain";
  //     }
  //     //await Keychain.resetGenericPassword()
      
  //  }  
  //  return password2
  // }

    //Funcion para hacer un pago
    pago=(direccion, monto)=>{
    server
    .loadAccount(publicKeyDestination2)
    //Receive account and build transaction
    .then(function(account){
          var transaction = new StellarSdk.TransactionBuilder(account)
                  // operacion para hacer un pago
                  .addOperation(StellarSdk.Operation.payment({
                      destination: direccion,
                      asset: mxnAsset,
                      amount: monto
                  }))
                  .build();
          // firma la operacion
          transaction.sign(StellarSdk.Keypair.fromSecret(privateKeyDestination2)); 

      // The XDR (encoded in base64) of the transaction built
        console.log(transaction.toEnvelope().toXDR('base64'));

          return server.submitTransaction(transaction);
    })
    .then(function (transactionResult) {
      console.log(transactionResult);
      alert("Pago exitoso!")
    })
      .catch((error) => {
        console.log(error);
        alert("No se pudo completar el pago");
      })
    .catch(function (err) {
      console.log(err);
      alert("No se pudo completar el pago");
    });
  }

  pagarHandler=()=>{
    if (this.state.Cantidad=='' && !this.state.isLoading){
      
    }else {
      this.state.isLoading = true;
      this.pago(this.state.Direccion, this.state.Cantidad)
      this.state.isLoading = false;
    }
  }

  imprimirBalance=()=>{
      var balanceRaw = String(JSON.stringify(this.state.data))      
      return balanceRaw.split(",")[0].substring(13).slice(0,-6)
  }

  render() {
    const { navigation } = this.props;
    const datosQR = navigation.getParam('datosQR', 'NO-DATA')
    if(!this.state.didLoad){

    }
    if(datosQR!='NO-DATA' && activo){
      this.setState({Direccion: datosQR});
      activo = false;
    } 
      let pic = {
            uri: '/Users/bernardosuarez/Desktop/CarteraPrueba/user\ \(1\).png'};

    return (
      <View style={styles.container}>
      <Image source={pic} style={{width: 70, height:70, paddingTop:20}}/>
        <Text style={styles.importante}>
        Balance:
        </Text>
        <Text style={styles.importante}>
         ${this.imprimirBalance()}
        </Text> 
        <TextInput 
        placeholder='Cantidad MXN'
        value={this.state.Cantidad} 
        onChangeText={this.cantidadChangeHandler}
        /> 
         <TextInput 
        placeholder='Dirección'
        value={this.state.Direccion} 
        onChangeText={this.direccionChangeHandler}
        /> 
      
        <Button 
        title='Pagar'
        onPress={() => this.pagarHandler()}
        />
          <Button
         title="Mi QR"
         onPress={() => this.props.navigation.navigate('Details')}
         />

           <Button
         title="Escanear"
         onPress={() => this.props.navigation.navigate('ScanQR')}
         />
        
      </View>


    );
  }
}

class ScanScreen extends React.Component {
  static navigationOptions={
    title:'ScanScreen',

    };
  onSuccess(e) {
    //this.setState({ Direccion: e.data});
    this.props.navigation.navigate('Home', 
     {
        datosQR: e.data
     });
    activo = true;
  }

  render() {
    return (
       <QRCodeScanner
        initialRoute={{
          component: QRCodeScanner,
          title: 'Scan Code',
          passProps: {
            onRead: this.onSuccess.bind(this),
            cameraStyle: styles.cameraContainer,
            topViewStyle: styles.zeroContainer,
            bottomViewStyle: styles.zeroContainer,
          }
        }}
        style={{flex: 1}}
      />
    );
  }
}


class Perfil extends React.Component {
    static navigationOptions={
    title:'Perfil',
    };
    render() {
        return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent:'center', backgroundColor: '#FDFEFE' }}>
                 <QRCode
          value={'GDMZXWG46ZYPM7ROEFQPYOFTR253RPCHSB2KWXCV2YBYZ6I2KZ7GB6JX'}
          size={200}
          bgColor='black'
          fgColor='white'/>

                </View>
                );
    }

}



export default createStackNavigator({
                                     Home: {
                                     screen: HomeScreen
                                     },
                                     Details: {
                                     screen: Perfil
                                     },
                                     ScanQR:{
                                    screen: ScanScreen
                                     }

                                     });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FDFEFE',
  },
  importante:{
    fontSize:40
  },
    zeroContainer: {
    height: 0,
    flex: 0,
  },

  cameraContainer: {
    height: Dimensions.get('window').height,
  },
});
  
  

