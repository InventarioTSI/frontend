/*
Componente que genera un documento PDF usando @react-pdf/renderer.
Se usa para crear un documento con información sobre dispositivos entregados a un trabajador.
*/

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Definición de estilos para el documento PDF
const styles = StyleSheet.create({
  container: {
    padding: 20,
    fontFamily: "Helvetica",
    fontSize: 12,
  },
  header: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
    textTransform: "uppercase",
    fontWeight: "bolder",
  },
  section: {
    marginBottom: 10,
  },
  strong: {
    fontWeight: "bold",
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    margin: "10px 0",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    padding: 5,
    width: "25%",
  },
  tableColHeader: {
    borderStyle: "solid",
    borderWidth: 1,
    padding: 5,
    width: "25%",
    backgroundColor: "#3498db",
    fontWeight: "bold",
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    fontSize: 10,
  },
  ol: {
    margin: 0,
    padding: 0,
  },
  li: {
    marginBottom: 5,
  },
  footer: {
    marginTop: 20,
    fontSize: 12,
  },
});

// Componente principal que genera el PDF del documento de entrega de dispositivos
export default function TemplatePDF(props) {
  return (
    <Document>
      <Page size="A4" style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.header}>
            DOCUMENTO DE ENTREGA DE INSTRUMENTOS PARA EL DESEMPEÑO DE LAS
            FUNCIONES ENCOMENDADAS
          </Text>
          <Text>
            El abajo firmante,
            <Text style={styles.strong}>
              {"                                          "}
            </Text>
            con DNI{" "}
            <Text style={styles.strong}>
              {"                                          "}
            </Text>
            como persona trabajadora de{" "}
            <Text style={styles.strong}>
              TÉCNICAS Y SERVICIOS DE INGENIERÍA, S.L.
            </Text>{" "}
            con B78065638 y domicilio social sito en{" "}
            <Text style={styles.strong}>
              AVDA. PÍO XII, Nº 44; TORRE 2 BAJO IZQUIERDA,28016 MADRID(MADRID)
            </Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.header}>DECLARA</Text>
          <View style={styles.ol}>
            <View style={styles.li}>
              <Text>
                <Text style={styles.strong}>PRIMERO.-</Text> Que ha recibido los
                dispositivos que se detallan a continuación:
              </Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <View style={styles.tableColHeader}>
                    <Text style={styles.tableCell}>TIPO DE DISPOSITIVO</Text>
                  </View>
                  <View style={styles.tableColHeader}>
                    <Text style={styles.tableCell}>REFERENCIA</Text>
                  </View>
                  <View style={styles.tableColHeader}>
                    <Text style={styles.tableCell}>MODELO</Text>
                  </View>
                  <View style={styles.tableColHeader}>
                    <Text style={styles.tableCell}>NUMERO DE SERIE</Text>
                  </View>
                </View>
                {props.devices.map((device, index) => (
                  <View style={styles.tableRow} key={index}>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{device.Tipo}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{device.Referencia}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{device.Modelo}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{device.NumSerie}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.li}>
              <Text>
                <Text style={styles.strong}>SEGUNDO.-</Text> Que los
                dispositivos recibidos son instrumentos propiedad de TÉCNICAS Y
                SERVICIOS DE INGENIERÍA, S.L. que ésta pone a su disposición
                para el desempeño de sus funciones.
              </Text>
            </View>
            <View style={styles.li}>
              <Text>
                <Text style={styles.strong}>TERCERO.-</Text> Que, en ningún
                caso, dichos elementos forman parte de su retribución, sino que
                son elementos necesarios para el correcto desempeño de sus
                funciones.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.header}>ACUERDOS</Text>
          <View style={styles.ol}>
            <View style={styles.li}>
              <Text>
                <Text style={styles.strong}>PRIMERO.-</Text> Que la persona
                trabajadora no hará un uso indebido de dichos dispositivos, ni
                de ningún otro a que tuviera acceso con motivo de la relación
                laboral que le vincula a la entidad.
              </Text>
            </View>
            <View style={styles.li}>
              <Text>
                <Text style={styles.strong}>SEGUNDO.-</Text> Que la persona
                trabajadora cumplirá y hará cumplir la Política de Seguridad de
                TÉCNICAS Y SERVICIOS DE INGENIERÍA, S.L. y, en particular, la
                relativa a la normativa interna de uso de los ordenadores
                portátiles, al uso responsable del teléfono móvil.
              </Text>
            </View>
            <View style={styles.li}>
              <Text>
                <Text style={styles.strong}>TERCERO.-</Text> Que la persona
                trabajadora deberá informar a TÉCNICAS Y SERVICIOS DE
                INGENIERÍA, S.L. de cualquier desperfecto observado en los
                elementos puestos a su disposición.
              </Text>
            </View>
            <View style={styles.li}>
              <Text>
                <Text style={styles.strong}>CUARTO.-</Text> Que la persona
                trabajadora deberá informar a TÉCNICAS Y SERVICIOS DE
                INGENIERÍA, S.L. del extravío, hurto o robo de cualquiera de los
                elementos puestos a su disposición.
              </Text>
            </View>
            <View style={styles.li}>
              <Text>
                <Text style={styles.strong}>QUINTO.-</Text> Que la persona
                trabajadora deberá devolver a la entidad el material
                especificado en la Declaración Primera a requerimiento de
                aquélla o si, por cualquier motivo, la persona trabajadora
                llegara a causar baja en la compañía, sin necesidad de
                requerimiento efectuado por la entidad.
              </Text>
            </View>
            <View style={styles.li}>
              <Text>
                <Text style={styles.strong}>SEXTO.-</Text> Por otro lado, la
                persona trabajadora manifiesta que ha sido informado de las
                auditorías periódicas que con carácter aleatorio, la entidad,
                puede realizar sobre el uso y destino que hace de los elementos
                de trabajo que le han sido entregados, y en consecuencia
                consiente sin reserva alguna a que dichas auditorías se lleven a
                cabo.
              </Text>
            </View>
            <View style={styles.li}>
              <Text>
                <Text style={styles.strong}>SÉPTIMO.-</Text> Igualmente, la
                persona trabajadora manifiesta que ha sido informado que el
                incumplimiento de la normativa interna sobre los elementos de
                trabajo podrá dar lugar a que por parte de la organización se le
                impongan sanciones disciplinarias.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text>
            En último lugar, TÉCNICAS Y SERVICIOS DE INGENIERÍA, S.L. informa
            que con la firma del compromiso/autorización la persona trabajadora
            queda informada de sus obligaciones y derechos relativos al uso de
            dispositivos corporativos.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>
            En Madrid, a <Text style={styles.strong}>{props.date}</Text>
          </Text>
          <Text style={{ textAlign: "right" }}>
            TÉCNICAS Y SERVICIOS DE INGENIERÍA, S.L.
          </Text>
          <Text>Fdo:</Text>
          <Text>El trabajador</Text>
          <Text style={{ textAlign: "right" }}>Fdo: Ángela López Domingo</Text>
          <Text style={{ textAlign: "right" }}>La empresa</Text>
        </View>
      </Page>
    </Document>
  );
}