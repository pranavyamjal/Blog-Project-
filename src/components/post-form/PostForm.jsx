import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "../index";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
  const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
    defaultValues: {
      title: post?.title || "",
      slug: post?.$id || "",
      content: post?.content || "",
      status: post?.status || "active",
    },
  });

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  const submit = async (data) => {
    try {
      console.log("Form Data:", data);

      // Ensure userData exists and has $id
      if (!userData || !userData.$id) {
        throw new Error("User data is missing or invalid.");
      }

      let fileId;
      if (data.image && data.image.length > 0) {
        const file = await appwriteService.uploadFile(data.image[0]);
        fileId = file ? file.$id : undefined;

        if (!fileId) {
          console.error("File upload failed, no file ID returned.");
        } else {
          console.log("Uploaded File ID:", fileId);
        }

        if (post?.featuredimage && file) {
          await appwriteService.deleteFile(post.featuredimage);
        }
      }

      const updatedData = {
        ...data,
        featuredimage: fileId || post?.featuredimage || "", // Assign empty string if no image
        userId: userData.$id, // Safe access to userData.$id
      };

      let dbPost;
      if (post) {
        dbPost = await appwriteService.updatePost(post.$id, updatedData);
      } else {
        dbPost = await appwriteService.createPost(updatedData);
      }

      if (dbPost) {
        navigate(`/post/${dbPost.$id}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error.message);
    }
  };

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string")
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s/g, "-");

    return "";
  }, []);

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      <div className="w-2/3 px-2">
        <Input
          label="Title :"
          placeholder="Title"
          className="mb-4"
          {...register("title", { required: true })}
        />
        <Input
          label="Slug :"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", { required: true })}
          onInput={(e) => {
            setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
          }}
        />
        <RTE
          label="Content :"
          name="content"
          control={control}
          defaultValue={getValues("content")}
          rules={{ required: "Content is required" }}
        />
      </div>
      <div className="w-1/3 px-2">
        <Input
          label="Featured Image :"
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image")}
        />
        {post && post.featuredimage ? (
          <div className="w-full mb-4">
            <img
              src={appwriteService.getFilePreview(post.featuredimage)}
              alt={post.title}
              className="rounded-lg"
            />
          </div>
        ) : (
          <p>No featured image available</p>
        )}
        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4"
          {...register("status", { required: true })}
        />
        <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full">
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}
