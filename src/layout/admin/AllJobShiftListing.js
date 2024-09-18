import React, { useState, useEffect, useMemo } from 'react';
import { Modal, TextInput, View, Image, Animated, StyleSheet, ScrollView, StatusBar, Alert, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { StarRatingDisplay } from 'react-native-star-rating-widget';
import RadioGroup from 'react-native-radio-buttons-group';
import images from '../../assets/images';
import MFooter from '../../components/Mfooter';
import SubNavbar from '../../components/SubNavbar';
import { Table } from 'react-native-table-component';
import { Jobs, Update, Clinician, removeJob, Job, setAwarded, updateHoursStatus } from '../../utils/useApi';
import { Dropdown } from 'react-native-element-dropdown';
import AHeader from '../../components/Aheader';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';

export default function AllJobShiftListing({ navigation }) {

  //---------------------------------------Animation of Background---------------------------------------
  const [backgroundColor, setBackgroundColor] = useState('#0000ff'); // Initial color
  let colorIndex = 0;
  const [data, setData] = useState([]);
  const [isJobDetailModal, setIsJobDetailModal] = useState(false);
  const [isAwardJobModal, setIsAwardJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedBidders, setSelectedBidders] = useState([]);
  const [selectedBidder, setSelectedBidder] = useState([]);
  const [awardedStatus, setAwardedStatus] = useState(2);
  const [isHoursDetailModal, setIsHoursDetailModal] = useState(false);
  const [showFromDate, setShowFromDate] = useState(false);
  const [showToDate, setShowToDate] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [preTime, setPreTime] = useState('');
  const [lunch, setLunch] = useState('');
  const [content, setContent] = useState('');
  const [approved, setApproved] = useState(false);
  const [clinicians, setClinicians] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Generate a random color
      if (colorIndex >= 0.9) {
        colorIndex = 0;
      } else {
        colorIndex += 0.1;
      }

      const randomColor = colorIndex == 0 ? `#00000${Math.floor(colorIndex * 256).toString(16)}` : `#0000${Math.floor(colorIndex * 256).toString(16)}`;
      setBackgroundColor(randomColor);
    }, 500); // Change color every 5 seconds

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  const tableHead = [
    'Entry Date',
    'Customer',
    'JobId',
    'JobNum -#.',
    'Location',
    'Date',
    'Shift',
    'View Shift & Bids',
    'Nurse Type',
    'Job Status',
    'Hired',
    'Bids',
    'View Hours',
    'Hours Submitted?',
    'Hours Approved?',
    'Timesheet',
    'Verfication',
    'No Status Explanation',
    'Delete'
  ];

  const getData = async () => {
    let data = await Jobs('jobs', 'Admin');
    if(!data) {
      setData(['No Data'])
    } else {
      setData(data)
    }
    const uniqueValues = new Set();
    const transformed = [];
    
    let clinicianData = await Clinician('clinical/clinician', 'Admin');
    const extractData = clinicianData.map(item => {
      const firstName = item[1];
      const lastName = item[2];
      return firstName ? `${firstName} ${lastName}` : null;
    });

    const uniqueNames = Array.from(new Set(extractData.filter(name => name)));

    uniqueNames.forEach(subarray => {
      const value = subarray; // Get the second element
      if (!uniqueValues.has(value)) { // Check if it's already in the Set
          uniqueValues.add(value); // Add to Set
          transformed.push({ label: value, value: value }); // Add to transformed array
      }
    });

    setClinicians(transformed);
  }

  useFocusEffect(
    React.useCallback(() => {
      getData();
    }, [])
  );

  const handleShowFile = (jobId) => {
    console.log('clicked => ', jobId);
    navigation.navigate("FileViewer", { jobId: jobId });
  };

  //---------------DropDown--------------
  const pageItems = [
    {label: '10 per page', value: '1'},
    {label: '25 per page', value: '2'},
    {label: '50 per page', value: '3'},
    {label: '100 per page', value: '4'},
    {label: '500 per page', value: '5'},
    {label: '1000 per page', value: '6'},
  ];

  const approve_status = [
    {label: 'Yes', value: true},
    {label: 'No', value: false}
  ];

  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false); 
  const [isFocus1, setIsFocus1] = useState(false); 
  const widths = [150, 130, 100, 100, 200, 120, 100, 200, 150, 120, 150, 80, 150, 200, 200, 150, 250, 250, 100];
  const [modal, setModal] = useState(false)
  const toggleModal = () => {
    setModal(!modal);
  }
  const [rowData, setRowData] = useState(null);
  const [modalItem, setModalItem] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [label, setLabel] = useState(null);
  const [date,setDate] = useState(new Date());

  const handleDay = (day) => {
    setDate(day);
    setLabel(moment(day).format("MM/DD/YYYY"));
  }

  const toggleHoursDetailModal = () => {
    setIsHoursDetailModal(!isHoursDetailModal);
  };

  const toggleJobDetailModal = () => {
    setIsJobDetailModal(!isJobDetailModal);
  };

  const toggleJobAwardModal = () => {
    setIsAwardJobModal(!isAwardJobModal);
  };

  const handleChangeAwardStatus = async (bidderId, jobId) => {
    const response = await setAwarded({ jobId: jobId, bidderId: bidderId, status: awardedStatus }, 'jobs');
    if (!response?.error) {
      console.log('success');
      getData();
      setIsAwardJobModal(false);
    } else {
      console.log('failure', response.error);
      Alert.alert('Failure!', 'Please retry again later', [
        {
          text: 'OK',
          onPress: () => {
            console.log('');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const radioButtons = useMemo(() => ([
    {
      id: 1,
      label: 'Awarded',
      value: 1
    },
    {
      id: 2,
      label: 'Not Awarded',
      value: 2
    }
  ]), []);

  //---------------DropDown--------------
  const jobStatus = [
    {label: 'Available', value: '1'},
    {label: 'Awarded', value: '2'},
    {label: 'Pending Verification', value: '3'},
    {label: 'Cancelled', value: '4'},
    {label: 'Verified', value: '5'},
    {label: 'Paid', value: '6'},
  ];

  const [location, setLocation] = useState([
    {label: 'Select...', value: 'Select...'},
    {label: 'Lancaster, NY', value: 'Lancaster, NY'},
    {label: 'Skilled Nursing Facility', value: 'Skilled Nursing Facility'},
    {label: 'Springville, NY', value: 'Springville, NY'},
    {label: 'Warsaw, NY', value: 'Warsaw, NY'},
    {label: 'Williansville', value: 'Williansville'},
  ]);

  const [isJobFocus, setJobIsFocus] = useState(false);

  const [suc, setSuc] = useState(0);
  const getLocalTimeOffset = () => {
    const date = new Date();
    const offsetInMinutes = date.getTimezoneOffset(); // Offset in minutes
    const offsetInHours = offsetInMinutes / 60; // Convert to hours
    return offsetInHours;
  };

  const handleRemove = async (id) => {
    let results = await removeJob({ jobId: id }, 'jobs');
    if (!results?.error) {
      console.log('success');
      Alert.alert('Success!', 'Successfully Removed', [
        {
          text: 'OK',
          onPress: () => {
            console.log('removed');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
      getData();
    } else {
      console.log('failure', results.error);
    }
  };

  const bidderTableHeader = [
    "Entry Date",
    "Caregiver",
    "Details",
    "Message From Applicant",
    "Bid Status",
    "Award Job",
    "",
    "",
    ""
  ];

  const handleShowHoursModal = async (id) => {
    console.log(id);
    let data = await Job({ jobId: id }, 'jobs');
    if(!data) {
      setSelectedJob(null);
    } else {
      setSelectedJob(data.jobData);
      setApproved(data.jobData.isHoursApproved);
      setContent('');
      setLunch(data.jobData.lunch);
      setPreTime();
      setToDate(new Date());
      setFromDate(new Date());
      setIsHoursDetailModal(true);
    }
  };

  const handleShowJobDetailModal = async (id) => {
    console.log(id);
    let data = await Job({ jobId: id }, 'jobs');
    console.log('--------------------------------', data);
    if(data?.error) {
      setSelectedJob(null);
      setSelectedBidders([]);
    } else {
      let biddersList = data.bidders;
      biddersList.unshift(bidderTableHeader);
      setSelectedJob(data.jobData);
      setSelectedBidders(biddersList);
      setIsJobDetailModal(true);
    }
  };

  const handleShowJobEditModal = async () => {
    console.log(selectedJob);
  };

  const handleShowJobAwardModal = async (id) => {
    let bidder = [];
    selectedBidders.map((item, idx) => {
      if (item[6] === id) {
        bidder = item;
      }
    });

    if (bidder) {
      setIsJobDetailModal(false);
      setSelectedBidder(bidder);
      setAwardedStatus(bidder[4] === 'Awarded' ? 1 : 2);
      setIsAwardJobModal(true);
    } else {
      setSelectedBidder([]);
    }
  };

  const handlechangeHoursStatus = async () => {
    let results = await updateHoursStatus({ jobId: selectedJob.jobId, fromDate: fromDate, endDate: toDate, preTime: preTime, approved: approved, lunch: lunch, explanation: content }, 'jobs');
    if (!results?.error) {
      console.log('success');
      getData();
      setIsHoursDetailModal(false);
    } else {
      console.log('failure', results.error);
    }
  };

  const bidderTableWidth = [150, 150, 140, 200, 150, 100];
  const RenderItem1 = ({ item, index }) => (
    <View
      key={index}
      style={{
        backgroundColor: index == 0 ? '#ccffff' : '#fff',
        flexDirection: 'row',
      }}
    >
      {bidderTableWidth.map((width, idx) => {
        if (idx === 2 && index > 0) {
          return (
            <View
              key={idx}
              style={[
                styles.tableItemStyle,
                { flex: 1, justifyContent: 'center', alignItems: 'center', width },
              ]}
            >
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 5,
                  backgroundColor: 'green',
                  borderRadius: 20,
                }}
                onPress={() => {
                  console.log(item[6]);
                  navigation.navigate("ClientProfile", {id: item[6]});
                }}
              >
                <Text style={styles.profileTitle}>View</Text>
              </TouchableOpacity>
            </View>
          );
        } else if (idx === 5 && index > 0) {
          return (
            <View
              key={idx}
              style={[
                styles.tableItemStyle,
                { flex: 1, justifyContent: 'center', alignItems: 'center', width },
              ]}
            >
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 5,
                  backgroundColor: 'green',
                  borderRadius: 20,
                }}
                onPress={() => {
                  handleShowJobAwardModal(item[6]);
                }}
              >
                <Text style={styles.profileTitle}>Click</Text>
              </TouchableOpacity>
            </View>
          );
        } else {
          return (
            <Text
              key={idx}
              style={[styles.tableItemStyle, { width }]}
            >
              {item[idx]}
            </Text>
          );
        }
      })}
    </View>
  );

  const BidderTableComponent = () => (
    <View style={{ borderColor: '#AAAAAA', borderWidth: 1, marginBottom: 3 }}>
      {selectedBidders.map((item, index) => (
        <RenderItem1 key={index} item={item} index={index} />
      ))}
    </View>
  );

  const handlePress = async() => {
    const offestTime = getLocalTimeOffset();
    let sendData = label;
    if (modalItem === 3 || modalItem === 10) {
      sendData = Number(sendData)
    }
    let sendingData = {}
    if (modalItem === 1) {
      sendingData = {
        jobId: rowData, // Ensure rowData is defined and contains the appropriate value
        nurse: sendData, // Use sendData for jobNum
        offestTime: offestTime
      };
    } else if (modalItem === 3) {
      sendingData = {
        jobId: rowData,
        jobNum: sendData // Use sendData for location
      };
    } else if (modalItem === 4)  {
      // Handle other modalItems as needed
      sendingData = {
        jobId: rowData,
        location: sendData // Use sendData for location
      };
    } else if (modalItem === 5)  {
      // Handle other modalItems as needed
      sendingData = {
        jobId: rowData,
        shiftDate: sendData // Use sendData for location
      };
    } else if (modalItem === 6)  {
      // Handle other modalItems as needed
      sendingData = {
        jobId: rowData,
        shiftTime: sendData, // Use sendData for location
        offestTime: offestTime
      };
    } else if (modalItem === 9)  {
      // Handle other modalItems as needed
      sendingData = {
        jobId: rowData,
        jobStatus: sendData, // Use sendData for location
        offestTime: offestTime
      };
    } else if (modalItem === 10)  {
      // Handle other modalItems as needed
      sendingData = {
        jobId: rowData,
        jobRating: sendData, // Use sendData for location
      };
    }

    let data = await Update(sendingData, 'jobs');
    if(data) setSuc(suc+1);
    else setSuc(suc);
    toggleModal();
    getData();
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent backgroundColor="transparent"
      />
      <AHeader navigation={navigation}  currentPage={1} />
      <SubNavbar navigation={navigation} name={"AdminLogin"}/>
      <ScrollView style={{ width: '100%', marginTop: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topView}>
          <Animated.View style={[styles.backTitle, { backgroundColor }]}>
            <Text style={styles.title}>COMPANY JOBS / SHIFTS</Text>
          </Animated.View>
          <View style={styles.bottomBar} />
        </View>
        <View style={{ marginTop: 30, flexDirection: 'row', width: '90%', marginLeft: '5%', gap: 10 }}>
          <TouchableOpacity style={[styles.subBtn, {}]} onPress={() => navigation.navigate('AdminJobShift')}>
            <View style={{ backgroundColor: 'white', borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
              <Text style={{ fontWeight: 'bold', color: '#194f69', textAlign: 'center', marginTop: 0 }}>+</Text>
            </View>
            <Text style={styles.profileTitle}>Add A New Job / Shift
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profile}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ backgroundColor: '#000080', color: 'white', paddingHorizontal: 5 }}>TOOL TIPS</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>When A New "Job / Shift" is added the status will appear as <Text style={{ backgroundColor: '#ffff99' }}>"AVAILABLE"</Text> & will appear on Caregivers Dashboard</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>Caregivers can "Bid" or show interest on all "Job / Shifts" - Available</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>Facilities can view all bids and award a shift to the nurse of choice, once awarded the Job / Shift will update to a stus of <Text style={{ backgroundColor: '#ccffff' }}>"AWARDED"</Text></Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>Once the Caregiver has completed the "Job / Shift" and uploads there timesheet, the status will update to <Text style={{ backgroundColor: '#ccffcc' }}>"COMPLETED"</Text></Text>
          </View>
        </View>
        <View>
          <View style={styles.body}>
            <View style={styles.bottomBar} />
            <View style={styles.modalBody}>
              <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                <Text style={styles.profileTitle}>🖥️ FACILITY / SHIFT LISTINGS</Text>
              </View>
              <View style={styles.searchBar}>
              </View>
              <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.itemTextStyle}
                iconStyle={styles.iconStyle}
                data={pageItems}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={'100 per page'}
                value={value ? value : pageItems[3].value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setValue(item.value);
                  setIsFocus(false);
                }}
                renderLeftIcon={() => (
                  <View
                    style={styles.icon}
                    color={isFocus ? 'blue' : 'black'}
                    name="Safety"
                    size={20}
                  />
                )}
              />
              <ScrollView horizontal={true} style={{ width: '95%', borderWidth: 1, marginBottom: 30, borderColor: 'rgba(0, 0, 0, 0.08)' }}>
                <Table >
                  <View style={[styles.tableText, { flexDirection: 'row', backgroundColor: '#ccffff' }]}>
                    {tableHead.map((item, index) => (
                      <Text
                        key={index}
                        style={{ width: widths[index], justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
                      >
                        {item}
                      </Text>
                    ))}
                  </View>
                  {data.map((rowData, rowIndex) => (
                    <View key={rowIndex} style={{ flexDirection: 'row' }}>
                      {rowData.map((cellData, cellIndex) => {
                        if (cellData === 'view_shift') {
                          return (
                            <View
                              key={cellIndex}
                              style={[
                                styles.tableItemStyle,
                                { flex: 1, justifyContent: 'center', alignItems: 'center', width: 200 },
                              ]}
                            >
                              <TouchableOpacity
                                style={{
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  paddingHorizontal: 20,
                                  paddingVertical: 5,
                                  backgroundColor: 'green',
                                  borderRadius: 20,
                                }}
                                onPress={() => {
                                  console.log('job id => ', rowData[2]);
                                  handleShowJobDetailModal(rowData[2]);
                                }}
                              >
                                <Text style={styles.profileTitle}>View</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        } else if (cellData === 'view_hours') {
                          return (
                            <View
                              key={cellIndex}
                              style={[
                                styles.tableItemStyle,
                                { flex: 1, justifyContent: 'center', alignItems: 'center', width: 150 },
                              ]}
                            >
                              <TouchableOpacity
                                style={{
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  paddingHorizontal: 20,
                                  paddingVertical: 5,
                                  backgroundColor: 'green',
                                  borderRadius: 20,
                                }}
                                onPress={() => {
                                  console.log('job id =>', rowData[2]);
                                  handleShowHoursModal(rowData[2]);
                                }}
                              >
                                <Text style={styles.profileTitle}>View</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        } else if (cellData === 'delete') {
                          return (
                            <View
                              key={cellIndex}
                              style={[
                                styles.tableItemStyle,
                                { flex: 1, justifyContent: 'center', alignItems: 'center', width: widths[cellIndex] },
                              ]}
                            >
                              <TouchableOpacity
                                style={{
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  paddingHorizontal: 20,
                                  paddingVertical: 5,
                                  backgroundColor: 'green',
                                  borderRadius: 20,
                                }}
                                onPress={() => {
                                  Alert.alert('Alert!', 'Are you sure you want to delete this?', [
                                    {
                                      text: 'OK',
                                      onPress: () => {
                                        console.log('job id > ', rowData[2]);
                                        handleRemove(rowData[2]);
                                      },
                                    },
                                    { text: 'Cancel', style: 'cancel' },
                                  ]);
                                }}
                              >
                                <Text style={styles.profileTitle}>Delete</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        } else {
                          if (cellIndex == 15) {
                            return (
                              <Text
                                key={cellIndex}
                                style={[styles.tableItemStyle, { width: widths[cellIndex], color: 'blue' }]}
                                onPress={() => { handleShowFile(rowData[2]) }}
                              >
                                {cellData}
                              </Text>
                            );
                          } else {
                            return (
                              <Text
                                key={cellIndex}
                                style={[styles.tableItemStyle, { width: widths[cellIndex] }]}
                              >
                                {cellData}
                              </Text>
                            );
                          }
                        }
                      })}
                    </View>
                  ))}
                </Table>
              </ScrollView>
            </View>
          </View>
          
          <Modal
            visible={modal}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setModal(!modal);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.calendarContainer}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>{tableHead[modalItem]}</Text>
                  <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleModal}>
                    <Image source = {images.close} style={{width: 20, height: 20,}}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <View style={styles.modalBody}>
                    {
                      (modalItem === 1) || (modalItem === 4) || (modalItem === 9) ?
                        <Dropdown
                          style={[styles.dropdown, {width: '100%'}, isFocus && { borderColor: 'blue' }]}
                          placeholderStyle={styles.placeholderStyle}
                          selectedTextStyle={styles.selectedTextStyle}
                          inputSearchStyle={styles.inputSearchStyle}
                          itemTextStyle={styles.itemTextStyle}
                          iconStyle={styles.iconStyle}
                          data={
                            modalItem === 1 ? clinicians :
                            modalItem === 4 ?  location :
                            (modalItem === 9) && jobStatus
                          }
                          // search
                          maxHeight={300}
                          labelField="label"
                          valueField="value"
                          placeholder={label}
                          // searchPlaceholder="Search..."
                          value={label}
                          onFocus={() => setJobIsFocus(true)}
                          onBlur={() => setJobIsFocus(false)}
                          onChange={item => {
                            setLabel(item.label);
                            setJobIsFocus(false);
                          }}
                          renderLeftIcon={() => (
                            <View
                              style={styles.icon}
                              color={isJobFocus ? 'blue' : 'black'}
                              name="Safety"
                              size={20}
                            />
                          )}
                        />
                      :
                      (modalItem === 3) || (modalItem === 6) || (modalItem === 10) ?
                        (<TextInput
                          style={[styles.searchText, {width: '100%', paddingTop: 0, paddingBottom: 0, textAlignVertical: 'center'}]}
                          placeholder=""
                          onChangeText={e => setLabel(e)}
                          value={label || ''}
                        />)
                      :
                      modalItem === 5 ?
                        <View style={{flexDirection: 'column', width: '100%', gap: 5, position: 'relative'}}>
                          <TouchableOpacity onPress={() => {setShowCalendar(true), console.log(showCalendar)}} style={{width: '100%', height: 40}}>
                            <View pointerEvents="none">
                              <TextInput
                                style={[styles.searchText, {width: '100%', paddingTop: 0, textAlignVertical: 'center', color: 'black', paddingBottom: 0, fontSize: 18}]}
                                placeholder=""
                                value={label}
                                editable={false}
                              />
                            </View>
                          </TouchableOpacity>
                          {showCalendar 
                            && 
                            <>
                              <DatePicker
                                date={date}
                                onDateChange={(day) => handleDay(day)}
                                mode="date"
                                theme='light'
                                androidVariant="native"
                              />
                              <Button title="confirm" onPress={(day) =>{setShowCalendar(!showCalendar);}} />
                            </>
                          }
                        </View>
                      :
                      <></>
                    }
                    <TouchableOpacity style={styles.button} onPress={handlePress} underlayColor="#0056b3">
                      <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            visible={isJobDetailModal}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setIsJobDetailModal(!isJobDetailModal);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.calendarContainer, { height: '80%' }]}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>Facility View Job Details</Text>
                  <TouchableOpacity style={{width: 20, height: 20}} onPress={toggleJobDetailModal}>
                    <Image source = {images.close} style={{width: 20, height: 20}}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <ScrollView>
                    <View style={[styles.modalBody, { padding: 0, paddingVertical: 10 }]}>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Entry Date</Text>
                        <Text style={styles.content}>{selectedJob?.entryDate}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job-ID</Text>
                        <Text style={styles.content}>{selectedJob?.jobId}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job #</Text>
                        <Text style={styles.content}>{selectedJob?.jobNum}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Nurse</Text>
                        <Text style={styles.content}>{selectedJob?.nurse}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Bids / Offers</Text>
                        <Text style={styles.content}>{selectedJob?.bid_offer}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Nurse Req.</Text>
                        <Text style={styles.content}>{selectedJob?.degree}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Time</Text>
                        <Text style={styles.content}>{selectedJob?.shiftTime}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Date</Text>
                        <Text style={styles.content}>{selectedJob?.shiftDate}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Pay Rate</Text>
                        <Text style={styles.content}>{selectedJob?.payRate}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job Status</Text>
                        <Text style={styles.content}>{selectedJob?.jobStatus}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Timesheet Upload</Text>
                        <Text style={[styles.content, { color: 'blue' }]} onPress={() => { handleShowFile(selectedJob?.jobId); }}>{selectedJob?.timeSheet?.name}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job Rating</Text>
                        <Text style={styles.content}>
                          <StarRatingDisplay
                            rating={selectedJob?.jobRating}
                            maxStars={5}
                            starSize={25}
                          />
                        </Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Location</Text>
                        <Text style={styles.content}>{selectedJob?.location}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%'}}>
                        <TouchableOpacity style={[styles.button, { marginTop: 10, paddingHorizontal: 20 }]} onPress={handleShowJobEditModal} underlayColor="#0056b3">
                          <Text style={[styles.buttonText, { fontSize: 12 }]}>Edit Job / Shift</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%'}}>
                        <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                          <Text style={[styles.profileTitle, { fontSize: 12 }]}>ALL BIDS / OFFERS FOR SHIFT</Text>
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', paddingRight: '5%'}}>
                        <ScrollView horizontal={true} style={{width: '100%'}}>
                          <BidderTableComponent />
                        </ScrollView>
                      </View>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            visible={isAwardJobModal}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setIsAwardJobModal(!isAwardJobModal);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.calendarContainer, { height: '80%' }]}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>Award Job To Applicant</Text>
                  <TouchableOpacity style={{width: 20, height: 20}} onPress={toggleJobAwardModal}>
                    <Image source = {images.close} style={{width: 20, height: 20}}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <ScrollView>
                    <View style={[styles.modalBody, { padding: 0, paddingVertical: 10 }]}>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job #</Text>
                        <Text style={styles.content}>{selectedJob?.jobNum || ''}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Message From Applicant</Text>
                        <Text style={styles.content}>{selectedBidder[3] || ''}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job</Text>
                        <Text style={styles.content}>{selectedJob?.jobId || ''}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Applicant</Text>
                        <Text style={styles.content}>{selectedBidder[1] || ''}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Phone</Text>
                        <Text style={styles.content}>{selectedBidder[8] || ''}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Email</Text>
                        <Text style={styles.content}>{selectedBidder[7] || ''}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Date</Text>
                        <Text style={styles.content}>{selectedJob?.shiftTime || ''}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Time</Text>
                        <Text style={styles.content}>{selectedJob?.shiftDate || ''}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%'}}>
                        <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30, backgroundColor: 'green' }]}>
                          <Text style={[styles.profileTitle, { fontSize: 12 }]}>🖥️"CLICK "AWARDED"</Text>
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%'}}>
                        <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
                        <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>This will awrd the job to the applicant, and change the status of the JOB to "AWARDED" on your "Job Listings Tab"</Text>
                      </View>
                      <View style={{flexDirection: 'column', width: '100%', alignItems: 'flex-start', justifyContent: 'center'}}>
                        <View>
                          <Text style={{ fontWeight: 'bold', marginTop: 20, fontSize: 14 }}>Bid Status</Text>
                        </View>
                        <View style={{ color: 'black' }}>
                          <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={setAwardedStatus}
                            selectedId={awardedStatus}
                            containerStyle={{
                              flexDirection: 'column',
                              alignItems: 'flex-start'
                            }}
                            labelStyle={{
                              color: 'black'
                            }}
                          />
                        </View>
                      </View>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%'}}>
                      <TouchableOpacity
                        style={[styles.button, { marginTop: 10, paddingHorizontal: 20 }]}
                        onPress={() => handleChangeAwardStatus(selectedBidder[6], selectedJob?.jobId)} underlayColor="#0056b3"
                      >
                        <Text style={[styles.buttonText, { fontSize: 12 }]}>Submit</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            visible={isHoursDetailModal}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setIsHoursDetailModal(!isHoursDetailModal);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.calendarContainer, { height: '80%' }]}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>View Hours</Text>
                  <TouchableOpacity style={{width: 20, height: 20}} onPress={toggleHoursDetailModal}>
                    <Image source = {images.close} style={{width: 20, height: 20}}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <ScrollView>
                    <View style={[styles.modalBody, { padding: 0, paddingVertical: 10 }]}>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Caregiver</Text>
                        <Text style={styles.content}>{selectedJob?.nurse}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job-ID</Text>
                        <Text style={styles.content}>{selectedJob?.jobId}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Facility</Text>
                        <Text style={styles.content}>{selectedJob?.facility}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job Status</Text>
                        <Text style={styles.content}>{selectedJob?.jobStatus}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job #</Text>
                        <Text style={styles.content}>{selectedJob?.jobNum}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Sift Date & Time</Text>
                        <Text style={styles.content}>{selectedJob?.shiftDate}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Hours Submitted</Text>
                        <Text style={styles.content}>{selectedJob?.isHoursSubmit ? "yes" : "no"}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ffff99', marginBottom: 5, paddingLeft: 2}]}>Hours Worked</Text>
                        <Text style={styles.content}>{selectedJob?.shiftStartTime ? selectedJob?.shiftStartTime.split(' ')[1] + 'pm to ' + selectedJob?.shiftEndTime.split(' ')[1] + 'pm = ' + selectedJob?.workedHours : selectedJob?.workedHours}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Hours Approved?</Text>
                        <Text style={styles.content}>{selectedJob?.isHoursApproved ? "yes" : "no"}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Hours Comments</Text>
                        <Text style={styles.content}>{selectedJob?.hoursComments}</Text>
                      </View>
                      
                      <View style={styles.line}></View>

                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ffff99', marginBottom: 5, paddingLeft: 2, fontSize: 20}]}>Hours Worked</Text>
                        <Text style={[styles.content, { fontSize: 20 }]}>{selectedJob?.shiftStartTime != '' ? selectedJob?.shiftStartTime.split(' ')[1] + 'pm to ' + selectedJob?.shiftEndTime.split(' ')[1] + 'pm = ' + selectedJob?.workedHours : selectedJob?.workedHours}</Text>
                      </View>

                      <View style={{flexDirection: 'row', width: '100%'}}>
                        <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                          <Text style={[styles.profileTitle, { fontSize: 12 }]}>ADD HOURS</Text>
                        </View>
                      </View>

                      <View>
                        <Text style={styles.subtitle}>Time Submitted By Caregiver</Text>
                        <View style={{ flexDirection: 'column', width: '100%', gap: 5, position: 'relative' }}>
                          <TouchableOpacity onPress={() => setShowFromDate((prev) => !prev)} style={{ width: 300, height: 40, zIndex: 2 }}>
                            <View>
                              <TextInput
                                style={[styles.input, { width: '90%', position: 'absolute', zIndex: 1, color: 'black' }]}
                                placeholder=""
                                value={fromDate.toDateString()}
                                editable={false}
                              />
                            </View>
                          </TouchableOpacity>
                          {showFromDate && (
                            <>
                              <DatePicker
                                date={fromDate}
                                onDateChange={(day) => setFromDate(day)}
                                mode="date"
                                theme='light'
                                androidVariant="native"
                              />
                              <Button style={{ width: 300 }} buttonColor='rgb(26,115,232)' textColor='#fff' onPress={() =>setShowFromDate((prev) => !prev)}>Confirm</Button>
                            </>
                          )}
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '90%', paddingVertical: 10 }}>
                          <Text style={{ width: '90%', textAlign: 'center' }}>to</Text>
                        </View>
                        <View style={{ flexDirection: 'column', width: '100%', gap: 5, position: 'relative' }}>
                          <TouchableOpacity onPress={() => setShowToDate((prev) => !prev)} style={{ width: 300, height: 40, zIndex: 2 }}>
                            <View pointerEvents="none">
                              <TextInput
                                style={[styles.input, { width: '90%', position: 'absolute', zIndex: 1, color: 'black' }]}
                                placeholder=""
                                value={toDate.toDateString()}
                                editable={false}
                              />
                            </View>
                          </TouchableOpacity>
                          {showToDate && (
                            <>
                              <DatePicker
                                date={toDate}
                                theme="light"
                                onDateChange={(day) => setToDate(day)}
                                mode="date"
                                androidVariant="native"
                              />
                              <Button style={{ width: 300 }} buttonColor='rgb(26,115,232)' textColor='#fff' onPress={() =>setShowToDate((prev) => !prev)}>Confirm</Button>
                            </>
                          )}
                        </View>
                      </View>
                      <View>
                        <Text style={styles.subtitle}>Pre Time " Add In Total Hours Worked - from above</Text>
                        <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                          <TextInput
                            style={[styles.input, {width: '90%', color: 'black'}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            keyboardType="numeric"
                            onChangeText={e => setPreTime(e)}
                            value={preTime}
                          />
                        </View>
                      </View>

                      <View>
                        <Text style={styles.subtitle}>Hours Approved</Text>
                        <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                          <Dropdown
                            style={[styles.dropdown, isFocus1 && { borderColor: 'blue' }]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            itemTextStyle={styles.itemTextStyle}
                            iconStyle={styles.iconStyle}
                            data={approve_status}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder={''}
                            value={approved ? approved : approve_status[1].value}
                            onFocus={() => setIsFocus1(true)}
                            onBlur={() => setIsFocus1(false)}
                            onChange={item => {
                              setApproved(item.value);
                              setIsFocus1(false);
                            }}
                            renderLeftIcon={() => (
                              <View
                                style={styles.icon}
                                color={isFocus ? 'blue' : 'black'}
                                name="Safety"
                                size={20}
                              />
                            )}
                          />
                        </View>
                      </View>

                      <View>
                        <Text style={styles.subtitle}>No Status Explanation</Text>
                        <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                          <TextInput
                            style={[styles.inputs, { width: '90%', color: 'black'}]}
                            onChangeText={setContent}
                            value={content}
                            multiline={true}
                            textAlignVertical="top"
                            placeholder=""
                          />
                        </View>
                      </View>

                      <View>
                        <Text style={styles.subtitle}>Lunch</Text>
                        <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                          <TextInput
                            style={[styles.input, {width: '90%', color: 'black'}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            onChangeText={e => setLunch(e)}
                            value={lunch}
                          />
                        </View>
                      </View>

                      <View>
                        <Text style={styles.subtitle}>Final Hours Equation</Text>
                        <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                          <Text style={{width: '90%'}}>{preTime}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={{flexDirection: 'row', width: '100%'}}>
                      <TouchableOpacity
                        style={[styles.button, { marginTop: 10, paddingHorizontal: 20 }]}
                        onPress={handlechangeHoursStatus} underlayColor="#0056b3"
                      >
                        <Text style={[styles.buttonText, { fontSize: 12 }]}>Submit</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
      <MFooter />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%'
  },
  topView: {
    marginTop: 30,
    marginLeft: '10%',
    width: '80%',
  },
  tableItemStyle: { 
    borderColor: '#AAAAAA', 
    backgroundColor: '#ffffff',
    borderWidth: 1, 
    textAlign: 'center',
    textAlignVertical: 'center',
    minHeight: 50
  },
  line: {
    width: '100%',
    height: 5,
    backgroundColor: '#fff',
    marginVertical: 15
  },
  backTitle: {
    backgroundColor: 'black',
    width: '100%',
    height: 55,
    marginTop: 10,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 500,
    color: 'black',
  },
  title: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'left',
    backgroundColor: 'transparent',
    paddingVertical: 10,
  },
  bottomBar: {
    marginTop: 30,
    height: 5,
    backgroundColor: '#4f70ee1c',
    width: '100%',
  },
  text: {
    fontSize: 14,
    color: 'black',
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 30,
    width: '90%',
    marginLeft: '5%',
  },
  imageButton: {
    width: '100%',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  profile: {
    marginTop: 20,
    width: '84%',
    marginLeft: '7%',
    padding: 20,
    backgroundColor: '#c2c3c42e',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#b0b0b0',
  },
  profileTitleBg: {
    backgroundColor: '#BC222F',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '80%',
    marginLeft: '10%',
    marginBottom: 20,
  },
  profileTitle: {
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: 14,
    marginBottom: 10,
    fontStyle: 'italic',
    color: '#22138e',
    fontWeight: 'bold',
  },
  titles: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 30,
    width: '35%'
  },
  row: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DBDBDB',
    backgroundColor: 'white',
    width: '100%',
  },
  evenRow: {
    backgroundColor: '#7be6ff4f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    height: '20%,',
    padding: 20,
    borderBottomColor: '#c4c4c4',
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 16,
    lineHeight: 30,
    width: '60%'
  },
  closeButton: {
    color: 'red',
  },
  body: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 30,
    marginBottom: 100
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  calendarContainer: {
    backgroundColor: '#e3f2f1',
    borderRadius: 30,
    elevation: 5,
    width: '90%',
    flexDirection: 'column',
    borderWidth: 3,
    borderColor: '#7bf4f4',
  },
  modalBody: {
    backgroundColor: 'rgba(79, 44, 73, 0.19)',
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 30,
    paddingLeft: '5%'
  },
  searchBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '60%',
    borderRadius: 10,
    marginBottom: 10,
  },
  searchText: {
    width: '70%',
    backgroundColor: 'white',
  },
  searchBtn: {
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    color: '#2a53c1',
    height: 30
  },
  filter: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  filterBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    gap: 5
  },
  filterText: {
    color: '#2a53c1',
  },
  subBtn: {
    backgroundColor: '#194f69',
    borderColor: '#ffaa22',
    borderWidth: 2,
    borderRadius: 20,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    alignItems: 'center',
  },
  head: {
    backgroundColor: '#7be6ff4f',
    height: 40,
  },
  tableText: {
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    textAlignVertical: 'center',
    borderWidth: 1, 
    borderColor: 'rgba(0, 0, 0, 0.08)',
    height: 40,
    paddingTop: 10
  },
  dropdown: {
    height: 40,
    width: '50%',
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    color: 'black',
    fontSize: 16,
  },
  selectedTextStyle: {
    color: 'black',
    fontSize: 16,
  },
  itemTextStyle: {
    color: 'black',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  subtitle: {
    fontSize: 14,
    color: 'black',
    textAlign: 'left',
    paddingTop: 10,
    paddingBottom: 10
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    marginTop: 30,  
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  inputs: {
    marginTop: 5,
    marginBottom: 20,
    height: 100,
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    backgroundColor: 'white'
  },
  input: {
    backgroundColor: 'white',
    height: 40,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DBDBDB',
  },
});
