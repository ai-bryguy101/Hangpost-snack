import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, GraduationCap, MapPin } from "lucide-react-native";

import { useStore } from "../lib/store";
import { useRouter } from "../lib/router";
import { showToast } from "../lib/toast";
import { colors } from "../theme/colors";
import { sh } from "../theme/shared";
import { Button } from "../components/ui/Button";
import { GroupedTagPicker } from "../components/GroupedTagPicker";
import { ComboField } from "../components/ComboField";
import { CITIES } from "../lib/cities";
import { COLLEGES } from "../lib/colleges";
import { HOBBY_GROUPS, INTEREST_GROUPS, LIKE_GROUPS } from "../data/interests";

const PHOTO_OPTIONS = [5, 11, 15, 32, 49, 56].map((n) => `https://i.pravatar.cc/150?img=${n}`);

/** Edit = the same structured fields as onboarding (no free bio, ever). */
export function ProfileEditScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { me, saveProfile } = useStore();

  const [name, setName] = useState(me.name);
  const [intro, setIntro] = useState(me.intro ?? "");
  const [age, setAge] = useState(me.age ? String(me.age) : "");
  const [hometown, setHometown] = useState(me.hometown ?? "");
  const [college, setCollege] = useState(me.college ?? "");
  const [major, setMajor] = useState(me.major ?? "");
  const [job, setJob] = useState(me.job ?? "");
  const [hobbies, setHobbies] = useState(me.hobbies);
  const [interests, setInterests] = useState(me.interests);
  const [likes, setLikes] = useState(me.likes);
  const [avatar, setAvatar] = useState(me.avatar);

  function save() {
    saveProfile({
      name: name.trim() || me.name,
      intro: intro.trim() || null,
      age: age ? parseInt(age, 10) : null,
      hometown: hometown.trim() || null,
      college: college.trim() || null,
      major: major.trim() || null,
      job: job.trim() || null,
      hobbies,
      interests,
      likes,
      avatar,
    });
    showToast("Profile saved ✓");
    router.back();
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={sh.headerTitle}>Edit profile</Text>
        <Button size="sm" onPress={save} style={{ borderRadius: 999 }}>
          Save
        </Button>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={sh.fieldLabel}>Photo</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {PHOTO_OPTIONS.map((uri) => (
              <Pressable key={uri} onPress={() => setAvatar(uri)}>
                <Image
                  source={{ uri }}
                  style={{
                    height: 56,
                    width: 56,
                    borderRadius: 28,
                    borderWidth: 3,
                    borderColor: avatar === uri ? colors.primaryDark : "transparent",
                  }}
                />
              </Pressable>
            ))}
          </View>
          <Text style={sh.hint}>One photo, verified — recognition at the meetup, not a gallery.</Text>
        </View>

        <View>
          <Text style={sh.fieldLabel}>Name</Text>
          <TextInput value={name} onChangeText={setName} style={sh.input} maxLength={50} />
        </View>
        <View>
          <Text style={sh.fieldLabel}>Your intro · {140 - intro.length} left</Text>
          <TextInput
            value={intro}
            onChangeText={(v) => v.length <= 140 && setIntro(v)}
            multiline
            style={[sh.input, { minHeight: 64 }]}
            placeholder="One line people see first"
            placeholderTextColor={colors.placeholder}
          />
        </View>
        <View>
          <Text style={sh.fieldLabel}>Age</Text>
          <TextInput value={age} onChangeText={setAge} keyboardType="number-pad" style={sh.input} maxLength={3} />
        </View>
        <ComboField
          label="Hometown"
          value={hometown}
          onChangeText={setHometown}
          options={CITIES}
          placeholder="Columbus, OH"
          icon={MapPin}
        />
        <ComboField
          label="College"
          value={college}
          onChangeText={setCollege}
          options={COLLEGES}
          placeholder="Ohio State University"
          icon={GraduationCap}
        />
        <View>
          <Text style={sh.fieldLabel}>Major</Text>
          <TextInput value={major} onChangeText={setMajor} style={sh.input} placeholder="Finance" placeholderTextColor={colors.placeholder} />
        </View>
        <View>
          <Text style={sh.fieldLabel}>Job</Text>
          <TextInput value={job} onChangeText={setJob} style={sh.input} placeholder="Consulting analyst at Deloitte" placeholderTextColor={colors.placeholder} />
        </View>
        <View>
          <Text style={sh.fieldLabel}>What you actually do</Text>
          <GroupedTagPicker groups={HOBBY_GROUPS} selected={hobbies} onChange={setHobbies} addPlaceholder="Add a hobby…" />
        </View>
        <View>
          <Text style={sh.fieldLabel}>What you're into</Text>
          <GroupedTagPicker groups={INTEREST_GROUPS} selected={interests} onChange={setInterests} addPlaceholder="Add an interest…" />
        </View>
        <View>
          <Text style={sh.fieldLabel}>Your taste</Text>
          <GroupedTagPicker groups={LIKE_GROUPS} selected={likes} onChange={setLikes} addPlaceholder="Add a band, artist, show, author…" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
